import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ImageBackground, Image } from 'react-native'
import React from 'react'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigate } from 'react-router-native';

const Profile = () => {
  // Mock user data - in a real app, this would come from auth context or API
  const userData = {
    username: "Rudraksha Singh",
    mobileNumber: "+91 70814 99993",
    points: 1560,
    joinDate: "March 2023"
  }
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Add logout logic here - this would typically clear auth state and navigate to login
    console.log("Logout pressed")
    navigate('/login')
  }
  
  return (
    <View className="flex-1 bg-black">
     
      
      <ScrollView className="flex-1 px-4 pt-24">
        {/* Header */}
        <View className="mb-8">

        </View>

        {/* Profile Card */}
        <LinearGradient
          colors={['#111827', '#0f172a']}
          className="rounded-2xl p-1 mb-6 shadow-lg overflow-hidden"
        >
          <View className="border border-gray-800 rounded-xl bg-black bg-opacity-50 overflow-hidden">
            {/* Profile Header */}
            <LinearGradient
              colors={['#065f46', '#065f46', '#064e3b']}
              start={[0, 0]}
              end={[1, 0]}
              className="p-6"
            >
              <View className="flex-row items-center">
                <View className="bg-emerald-900 p-3 rounded-full mr-4 border-2 border-emerald-400">
                  {/* Use an actual avatar image in production */}
                  <Image 
                    source={{ uri: 'https://www.gravatar.com/avatar/?d=identicon' }} 
                    className="w-20 h-20 rounded-full"
                  />
                </View>
                <View>
                  <Text className="text-white text-2xl font-bold">{userData.username}</Text>
                  <View className="flex-row items-center mt-1">
                    <MaterialCommunityIcons name="leaf" size={16} color="#4ade80" />
                    <Text className="text-emerald-300 ml-1">Eco-Traveler</Text>
                  </View>
                  <View className="flex-row items-center mt-2 bg-black bg-opacity-20 px-3 py-1 rounded-full">
                    <Text className="text-gray-300 text-xs">Member since {userData.joinDate}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* Info Section */}
            <View className="p-6">
              {/* Mobile Number */}
              <View className="flex-row items-center mb-6">
                <View className="bg-gray-800 p-2 rounded-full mr-4">
                  <Ionicons name="call-outline" size={20} color="#22c55e" />
                </View>
                <View>
                  <Text className="text-gray-400 text-sm">Mobile Number</Text>
                  <Text className="text-white font-medium">{userData.mobileNumber}</Text>
                </View>
              </View>

              {/* Points */}
              <View className="flex-row items-center mb-2">
                <View className="bg-gray-800 p-2 rounded-full mr-4">
                  <Ionicons name="star" size={20} color="#eab308" />
                </View>
                <View>
                  <Text className="text-gray-400 text-sm">Current Points</Text>
                  <View className="flex-row items-center">
                    <Text className="text-white text-xl font-bold">{userData.points}</Text>
                    <Text className="text-yellow-500 ml-1">pts</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Actions Section */}
        <View className="mb-6">
          <Text className="text-white text-lg font-bold mb-3">Quick Actions</Text>
          
          <View className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
            {/* Edit Profile Button */}
            <TouchableOpacity className="p-4 flex-row items-center border-b border-gray-800">
              <View className="bg-blue-900 p-2 rounded-full mr-3">
                <Ionicons name="create-outline" size={18} color="#60a5fa" />
              </View>
              <Text className="text-white flex-1">Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
        </View>
      </View>


        {/* Logout Button */}
        <TouchableOpacity
          className="mb-8 overflow-hidden rounded-xl"
          onPress={handleLogout}
        >
          <LinearGradient
            colors={['#7f1d1d', '#991b1b']}
            start={[0, 0]}
            end={[1, 0]}
            className="p-4 rounded-lg flex-row items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={20} color="#fecaca" className="mr-2" />
            <Text className="text-red-100 font-bold ml-2">Log Out</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({})
