import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'

interface RewardCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  points: number;
  onSubmit: (proof: string) => void;
}

const RewardCard = ({ title, icon, description, points, onSubmit }: RewardCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [proof, setProof] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [plateImage, setPlateImage] = useState<string | null>(null);

  const pickImage = async () => {
    const{status} = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert("Sorry, we need camera permission to make this work!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2,4],
      quality: 1,
    });

    if (!result.canceled) {
      setPlateImage(result.assets[0].uri);
    }
  }

  const handleSubmit = () => {
    if(!proof || !plateImage) {
      alert('Please enter the name of proof and upload a photo of the proof')
      return;
    }
    
    onSubmit(proof);
    setSubmitted(true);
    setProof('');
    setPlateImage(null);
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
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
              <Text className="text-white text-lg mt-2">Successfully Submitted!</Text>
            </View>
          ) : (
            <>
              <Text className="text-white mb-2">Upload proof to claim reward:</Text>
              <TextInput
                className="bg-gray-600 text-white p-3 rounded-lg mb-3"
                placeholder="Describe or link your proof here..."
                placeholderTextColor="#9ca3af"
                value={proof}
                onChangeText={setProof}
                multiline
              />
                <TouchableOpacity 
                  className="bg-gray-600 rounded-lg mb-3 flex-row items-center justify-center"
                  onPress={pickImage}
                  style={{ height: 200 }} // Add fixed height for the container
                >
              {plateImage ? (
                <Image 
                  source={{uri: plateImage}} 
                  style={{ width: '100%', height: 200, resizeMode: 'cover' }}
                  className='rounded-lg'
                />
              ) : (
                <View className='items-center'>
                  <Ionicons name="camera" size={24} color="white" />
                  <Text className="text-white mt-2">Upload Photo</Text>
                </View>
              )}
                </TouchableOpacity>
              <TouchableOpacity 
                className={`py-3 px-6 rounded-lg items-center ${proof ? 'bg-green-600' : 'bg-gray-500'}`}
                onPress={handleSubmit}
                disabled={!proof}
              >
                <Text className="text-white font-bold">Submit for Verification</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const Redeem = () => {
interface RewardSubmission {
    proof: string;
}

const handleSubmit = (proof: string): void => {
    console.log("Proof submitted:", proof);
};

  return (
    <View className="flex-1 bg-black pt-12">
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">Redeem Rewards</Text>
        <Text className="text-gray-400 mb-4">Submit proof to claim your eco-rewards</Text>
      </View>
      
    <ScrollView className="flex-1 px-4">
      <RewardCard 
        title="Bus Ticket Reward" 
        icon="bus" 
        description="Public transport" 
        points={50}
        onSubmit={handleSubmit}
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
      />
      
      <RewardCard 
        title="Recycling Reward" 
        icon="leaf" 
        description="Recycled materials" 
        points={30}
        onSubmit={handleSubmit}
      />
    </ScrollView>
    </View>
  );
};

export default Redeem;

const styles = StyleSheet.create({});