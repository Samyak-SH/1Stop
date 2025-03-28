const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs").promises;
const os = require("os");

const submitReward = async (req, res) => {
  let tempFilePath = null;
  try {
    const { billType, image } = req.body;

    if (!billType || !image) {
      console.log("req received, but missing billType or image");
      console.log("billType:", billType);
      console.log("image:", image);
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
      res
        .status(500)
        .json({
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
        return res
          .status(500)
          .json({ error: "Failed to process the image", details: stderrData });
      }

      try {
        const jsonMatch = stdoutData.match(/\{.*\}/s);
        if (!jsonMatch) {
          throw new Error("No JSON found in Python script output");
        }
        const jsonString = jsonMatch[0];
        const result = JSON.parse(jsonString);
        console.log(result);
        const { statusCode, body } = result;

        if (statusCode !== 200) {
          console.log(`Verification failed: ${body.error || "Unknown error"}`);
          return res
            .status(statusCode)
            .json({ error: body.error || "Verification failed" });
        }
        //DB IDHAR BHARNA H OK?
        res.status(200).json({
          message: body.message,
          points: body.points,
          details: body.details,
          within_last_three_days: body.within_last_three_days || undefined,
          consumption_units: body.consumption_units || undefined,
        });
      } catch (error) {
        console.error(`Error parsing Python script output: ${error.message}`);
        console.error("stdoutData:", stdoutData);
        res
          .status(500)
          .json({
            error: "Failed to parse response from Lambda",
            details: error.message,
          });
      }
    });
  } catch (error) {
    console.error(`Error in submitReward: ${error.message}`);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

module.exports = { submitReward };
