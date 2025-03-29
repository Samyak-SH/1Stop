import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { getUID } from "@/data/uidController";

const RewardCard = ({
  title,
  icon,
  description,
  points,
  onSubmit,
  billType,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [plateImage, setPlateImage] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allowCrop, setAllowCrop] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (
        cameraStatus.status !== "granted" ||
        galleryStatus.status !== "granted"
      ) {
        alert(
          "Permissions not granted. Please enable camera and gallery access in your device settings."
        );
      }
    };
    requestPermissions();
  }, []);

  const pickImageFromCamera = async () => {
    const cameraStatus = await ImagePicker.getCameraPermissionsAsync();
    if (cameraStatus.status !== "granted") {
      const newStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (newStatus.status !== "granted") {
        alert(
          "Camera permission denied. Please enable it in your device settings."
        );
        return;
      }
    }

    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: allowCrop,
        aspect: [2, 4],
        quality: 1,
      });

      if (!result.canceled) {
        setPlateImage(result.assets[0].uri);
      } else {
        console.log("Camera action canceled");
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      alert("Failed to open camera: " + error.message);
    }
  };

  const pickImageFromGallery = async () => {
    const galleryStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (galleryStatus.status !== "granted") {
      const newStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (newStatus.status !== "granted") {
        alert(
          "Gallery permission denied. Please enable it in your device settings."
        );
        return;
      }
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: allowCrop,
        aspect: [2, 4],
        quality: 1,
      });

      if (!result.canceled) {
        setPlateImage(result.assets[0].uri);
      } else {
        console.log("Gallery action canceled");
      }
    } catch (error) {
      console.error("Error opening gallery:", error);
      alert("Failed to open gallery: " + error.message);
    }
  };

  const pickImage = () => {
    Alert.alert(
      "Select Image Source",
      "Choose where to get the image from:",
      [
        {
          text: "Take Photo",
          onPress: () => pickImageFromCamera(),
        },
        {
          text: "Choose from Gallery",
          onPress: () => pickImageFromGallery(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleSubmit = async () => {
    if (!plateImage) {
      alert("Please upload a photo of the proof");
      return;
    }

    setLoading(true);
    try {
      const result = await onSubmit("", plateImage, billType);
      setSubmitted(true);
      setPlateImage(null);
      setSubmissionResult("Successfully Submitted!");
      return result;
    } catch (error) {
      setSubmissionResult(
        "Submission Failed: " + (error.message || "Unknown error")
      );
      setSubmitted(true);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      className="w-full bg-gray-800 rounded-xl mb-4 overflow-hidden"
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-center p-4">
        <View className="flex-row items-center">
          <View className="bg-green-700 p-2 rounded-full mr-3">
            <Ionicons name={icon} size={24} color="white" />
          </View>
          <View>
            <Text className="text-white text-lg font-bold">{title}</Text>
            <Text className="text-gray-400">{description}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <Text className="text-green-500 font-bold mr-2">{points} pts</Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="white"
          />
        </View>
      </View>

      {expanded && (
        <View className="bg-gray-700 p-4">
          {submitted ? (
            <View className="items-center py-4">
              <Ionicons
                name={
                  submissionResult.includes("Failed")
                    ? "close-circle"
                    : "checkmark-circle"
                }
                size={48}
                color={
                  submissionResult.includes("Failed") ? "#ef4444" : "#22c55e"
                }
              />
              <Text className="text-white text-lg mt-2">
                {submissionResult}
              </Text>
            </View>
          ) : loading ? (
            <View className="items-center py-4">
              <ActivityIndicator size="large" color="#22c55e" />
              <Text className="text-white text-lg mt-2">Verifying...</Text>
            </View>
          ) : (
            <>
              <Text className="text-white mb-2">
                Upload proof to claim reward:
              </Text>
              <View className="flex-row items-center mb-2">
                <Text className="text-white mr-2">Enable cropping</Text>
                <Switch
                  value={allowCrop}
                  onValueChange={setAllowCrop}
                  trackColor={{ false: "#767577", true: "#22c55e" }}
                  thumbColor={allowCrop ? "#f4f3f4" : "#f4f3f4"}
                />
              </View>
              <TouchableOpacity
                className="bg-gray-600 rounded-lg mb-3 flex-row items-center justify-center"
                onPress={pickImage}
                style={{ height: 200 }}
              >
                {plateImage ? (
                  <Image
                    source={{ uri: plateImage }}
                    style={{ width: "100%", height: 200, resizeMode: "cover" }}
                    className="rounded-lg"
                  />
                ) : (
                  <View className="items-center">
                    <Ionicons name="camera" size={24} color="white" />
                    <Text className="text-white mt-2">
                      Take Photo/From Gallery
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className={`py-3 px-6 rounded-lg items-center ${
                  plateImage ? "bg-green-600" : "bg-gray-500"
                }`}
                onPress={handleSubmit}
                disabled={!plateImage}
              >
                <Text className="text-white font-bold">
                  Submit for Verification
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}

// Gift Card component for Rewards section
const GiftCard = ({ title, logo, description, requiredPoints, userPoints, onRedeem }) => {
  const canRedeem = userPoints >= requiredPoints;
  
  return (
    <View className="bg-gray-800 rounded-xl mb-4 overflow-hidden">
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white text-xl font-bold">{title}</Text>
          <View className="bg-green-700 px-3 py-1 rounded-full">
            <Text className="text-white font-bold">{requiredPoints} pts</Text>
          </View>
        </View>
        
        <View className="flex-row items-center">
          <Image 
            source={{ uri: logo }} 
            style={{ width: 80, height: 80 }} 
            className="rounded-lg mr-4"
          />
          <View className="flex-1">
            <Text className="text-gray-300 mb-2">{description}</Text>
            <TouchableOpacity
              className={`py-2 px-4 rounded-lg items-center ${canRedeem ? 'bg-green-600' : 'bg-gray-600'}`}
              disabled={!canRedeem}
              onPress={() => onRedeem(title, requiredPoints)}
            >
              <Text className="text-white font-bold">
                {canRedeem ? 'Redeem Now' : 'Not Enough Points'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const Redeem = () => {
  const [activeTab, setActiveTab] = useState('redeem'); // 'redeem' or 'rewards'
  const [userPoints, setUserPoints] = useState(250); // Mock user points
  
  const handleSubmit = async (proof, imageUri, billType) => {
    if (!imageUri) {
      throw new Error("Image is required");
    }

    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      const response = await fetch(manipulatedImage.uri);
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("Blob is empty");
      }

      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => {
          let base64String = reader.result.split(",")[1];
          base64String = base64String.replace(/\s/g, "");
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const imageBase64 = await base64Promise;
      const uid = await getUID();
      const serverResponse = await fetch(
        "http://192.168.5.58:3000/submit-reward",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${uid}`,
          },
          body: JSON.stringify({
            billType: billType || "no_bill_type",
            image: imageBase64,
          }),
        }
      );

      const result = await serverResponse.json();

      if (!serverResponse.ok) {
        throw new Error(result.error || "Failed to verify proof");
      }

      return result;
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  }
  
  const handleRedeemGiftCard = (cardTitle, pointsCost) => {
    Alert.alert(
      "Confirm Redemption",
      `Are you sure you want to redeem ${cardTitle} for ${pointsCost} points?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm",
          onPress: () => {
            setUserPoints(prev => prev - pointsCost);
            Alert.alert("Success", `You have successfully redeemed ${cardTitle}!`);
          }
        }
      ]
    );
  };

  // Tab switcher component
  const TabSwitcher = () => (
    <View className="flex-row bg-gray-800 rounded-full p-1 mx-4 mb-4">
      <TouchableOpacity 
        className={`flex-1 py-2 rounded-full ${activeTab === 'redeem' ? 'bg-green-600' : 'bg-transparent'}`}
        onPress={() => setActiveTab('redeem')}
      >
        <Text className="text-white font-bold text-center">Redeem</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        className={`flex-1 py-2 rounded-full ${activeTab === 'rewards' ? 'bg-green-600' : 'bg-transparent'}`}
        onPress={() => setActiveTab('rewards')}
      >
        <Text className="text-white font-bold text-center">Rewards</Text>
      </TouchableOpacity>
    </View>
  );

  // Content for Rewards tab
  const RewardsContent = () => (
    <ScrollView className="flex-1 px-4">
      <GiftCard
        title="Amazon Gift Card"
        logo="https://m.media-amazon.com/images/G/01/gc/designs/livepreview/a_generic_white_10_us_noto_email_v2016_us-main._CB627448186_.png"
        description="Redeem for anything on Amazon. Valid for 1 year from redemption."
        requiredPoints={200}
        userPoints={userPoints}
        onRedeem={handleRedeemGiftCard}
      />
      
      <GiftCard
        title="Starbucks Coffee"
        logo="https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/800px-Starbucks_Corporation_Logo_2011.svg.png"
        description="Get a $10 Starbucks gift card to enjoy your favorite coffee."
        requiredPoints={150}
        userPoints={userPoints}
        onRedeem={handleRedeemGiftCard}
      />
      
      <GiftCard
        title="Netflix Subscription"
        logo="https://cdn.cookielaw.org/logos/dd6b162f-1a32-456a-9cfe-897231c7763c/4345ea78-053c-46d2-b11e-09adaef973dc/Netflix_Logo_PMS.png"
        description="One month standard Netflix subscription."
        requiredPoints={300}
        userPoints={userPoints}
        onRedeem={handleRedeemGiftCard}
      />
      
      <GiftCard
        title="Uber Ride Credit"
        logo="https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Uber_App_Icon.svg/2048px-Uber_App_Icon.svg.png"
        description="$15 Uber ride credit to help you travel sustainably."
        requiredPoints={180}
        userPoints={userPoints}
        onRedeem={handleRedeemGiftCard}
      />
      
      <GiftCard
        title="Donation to Green Cause"
        logo="https://cdn-icons-png.flaticon.com/512/2971/2971416.png"
        description="We'll donate to plant trees on your behalf."
        requiredPoints={100}
        userPoints={userPoints}
        onRedeem={handleRedeemGiftCard}
      />
    </ScrollView>
  );

  // Content for the original Redeem tab
  const RedeemContent = () => (
    <ScrollView className="flex-1 px-4">
      <RewardCard
        title="Bus Ticket Reward"
        icon="bus"
        description="Public transport"
        points={50}
        onSubmit={handleSubmit}
        billType="bus"
      />

      <RewardCard
        title="Metro Ticket Reward"
        icon="train"
        description="Metro commute"
        points={75}
        onSubmit={handleSubmit}
      />

      <RewardCard
        title="House Bill Reward"
        icon="home"
        description="Reduced consumption"
        points={100}
        onSubmit={handleSubmit}
        billType="electricity"
      />

      <RewardCard
        title="Recycling Reward"
        icon="leaf"
        description="Recycled materials"
        points={30}
        onSubmit={handleSubmit}
      />
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-black pt-12">
      {/* Points display in corner */}
      <View className="absolute top-12 right-4 z-10 bg-green-800 px-3 py-1 rounded-full flex-row items-center">
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text className="text-white font-bold ml-1">{userPoints} points</Text>
      </View>
      
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">
          {activeTab === 'redeem' ? 'Redeem Rewards' : 'Claim Rewards'}
        </Text>
        <Text className="text-gray-400 mb-2">
          {activeTab === 'redeem' 
            ? 'Submit proof to claim your eco-rewards' 
            : 'Use your points to get these awesome rewards'}
        </Text>
      </View>
      
      <TabSwitcher />
      
      {activeTab === 'redeem' ? <RedeemContent /> : <RewardsContent />}
    </View>
  );
};

export default Redeem;

const styles = StyleSheet.create({});
