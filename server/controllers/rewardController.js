const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs").promises;
const os = require("os");
const { updatePoints } = require("./userController");

const submitReward = async (req, res) => {
  let tempFilePath = null;
  try {
    const { billType, image } = req.body;
    const uid = req.headers["authorization"]?.split(" ")[1];

    if (!billType || !image) {
      console.log("Request received, but missing billType or image");
      console.log("billType:", billType);
      console.log(
        "image:",
        typeof image,
        image ? image.substring(0, 50) + "..." : "N/A"
      );
      return res.status(400).json({ error: "billType and image are required" });
    }

    if (!["bus", "electricity"].includes(billType)) {
      console.log(`Invalid billType: ${billType}`);
      return res
        .status(400)
        .json({ error: 'Invalid billType. Must be "bus" or "electricity"' });
    }

    const imageBuffer = Buffer.from(image, "base64");

    const imageData = {
      buffer: imageBuffer,
      mimetype: "image/jpeg",
      originalname: "proof.jpg",
    };

    const imageBase64 = imageData.buffer.toString("base64");

    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    if (!base64Regex.test(imageBase64)) {
      console.log("Invalid Base64 string detected");
      return res.status(400).json({ error: "Invalid Base64 string" });
    }

    const pythonScriptPath = path.join(
      __dirname,
      "..",
      "python",
      "invoke_lambda.py"
    );

    tempFilePath = path.join(os.tmpdir(), `image_base64_${Date.now()}.txt`);
    await fs.writeFile(tempFilePath, imageBase64, "utf8");

    const pythonProcess = spawn(
      "python",
      [pythonScriptPath, billType, tempFilePath],
      {
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    let stdoutData = "";
    let stderrData = "";

    pythonProcess.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on("error", (error) => {
      console.error("Python process error:", error.message);
      res.status(500).json({
        error: "Failed to execute Python script",
        details: error.message,
      });
    });

    pythonProcess.on("close", async (code) => {
      try {
        if (tempFilePath) {
          await fs.unlink(tempFilePath);
        }
      } catch (error) {
        console.error("Error deleting temporary file:", error.message);
      }

      if (code !== 0) {
        console.error(`Python script error: ${stderrData}`);
        return res.status(500).json({
          error: "Failed to process the image",
          details: stderrData,
        });
      }

      try {
        // More robust JSON extraction
        const jsonMatch = stdoutData.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error("No valid JSON found in output");
          console.error("Raw output:", stdoutData);
          return res.status(500).json({
            error: "No valid JSON found",
            details: stdoutData,
          });
        }

        const jsonString = jsonMatch[0];
        const result = JSON.parse(jsonString);
        console.log("Parsed Result:", JSON.stringify(result, null, 2));

        // More comprehensive error handling
        if (!result || result.statusCode !== 200) {
          console.log(`Verification failed:`, result);
          return res.status(result?.statusCode || 500).json({
            error: result?.body?.error || "Verification failed",
          });
        }

        // Safely access nested properties
        const responseBody = result.body?.body || result.body;

        updatePoints(uid, responseBody);

        res.status(200).json({
          message: responseBody.message,
          points: responseBody.points,
          details: responseBody.details,
          consumption_units: responseBody.consumption_units,
          total_amount: responseBody.details?.["Total Amount"],
        });
      } catch (error) {
        console.error(`Error parsing Python script output:`, error);
        console.error("Raw stdoutData:", stdoutData);
        res.status(500).json({
          error: "Failed to parse response",
          details: error.message,
          rawOutput: stdoutData,
        });
      }
    });
  } catch (error) {
    console.error(`Error in submitReward:`, error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

module.exports = { submitReward };
