import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'

const index = () => {
  const [name, setName] = useState('');
  const [plateImage, setPlateImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }
    
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 2],
      quality: 1,
    });
    
    if (!result.canceled) {
      setPlateImage(result.assets[0].uri);
    }
  };
  
  const handleSubmit = () => {
    if (!name.trim() || !plateImage) {
      alert('Please enter your name and upload a photo of your vehicle plate');
      return;
    }
    
    setIsLoading(true);
    // In a real app, send data to backend here
  };
  
  return (
    <View className='flex-1 bg-black'>
      {isLoading ? (
        <View className='flex-1 justify-center items-center bg-black'>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className='text-white text-lg mt-4'>Authenticating your details...</Text>
          <Text className='text-gray-400 text-sm mt-2'>This may take a moment</Text>
        </View>
      ) : (
        <View className='flex-1 bg-black p-6'>
          <View className='flex-1 justify-center'>
            <Text className='text-2xl font-bold text-green-500 mb-8 text-center'>Vehicle Registration</Text>
            
            <View className='mb-6'>
              <Text className='text-white text-lg mb-2'>Your Full Name</Text>
              <TextInput
                className='bg-gray-900 border border-gray-800 rounded-lg p-4 text-white text-base'
                placeholder="Enter your name"
                placeholderTextColor="gray"
                value={name}
                onChangeText={setName}
              />
            </View>
            
            <Text className='text-white text-lg mb-2'>Vehicle Plate Image</Text>
            <TouchableOpacity 
              onPress={pickImage}
              className='bg-gray-900 border border-gray-800 rounded-lg p-4 items-center justify-center mb-8'
              style={{height: 180}}
            >
              {plateImage ? (
                <Image 
                  source={{uri: plateImage}} 
                  style={{width: '100%', height: '100%'}} 
                  className='rounded-lg'
                />
              ) : (
                <View className='items-center'>
                  <Ionicons name="camera" size={50} color="#22c55e" />
                  <Text className='text-gray-400 mt-3 text-base'>Tap to capture plate image</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              className='bg-green-600 rounded-lg py-4 items-center'
              onPress={handleSubmit}
            >
              <Text className='text-white font-semibold text-lg'>Submit for Verification</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

export default index

const styles = StyleSheet.create({})