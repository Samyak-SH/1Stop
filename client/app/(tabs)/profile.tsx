import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

const Profile = () => {
  // Mock user data - in a real app, this would come from auth context or API
  const userData = {
    username: "John Doe",
    mobileNumber: "+91 98765 43210",
    points: 1250
  }

  const handleLogout = () => {
    // Add logout logic here - this would typically clear auth state and navigate to login
    console.log("Logout pressed")
  }

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-4 pt-12">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-white text-2xl font-bold">Profile</Text>
          <Text className="text-gray-400 mt-1">Your account details</Text>
        </View>

        {/* Profile Card */}
        <View className="bg-gray-900 rounded-xl p-6 mb-6 shadow-md border border-gray-800">
          <View className="flex-row items-center mb-4">
            <View className="bg-green-700 p-3 rounded-full mr-4">
              <Ionicons name="person" size={24} color="white" />
            </View>
            <View>
              <Text className="text-white text-xl font-bold">{userData.username}</Text>
              <Text className="text-gray-400">Eco-Traveler</Text>
            </View>
          </View>

          {/* Mobile Number */}
          <View className="flex-row items-center mb-4">
            <Ionicons name="call-outline" size={20} color="#22c55e" className="mr-3" />
            <View>
              <Text className="text-gray-400 text-sm">Mobile Number</Text>
              <Text className="text-white">{userData.mobileNumber}</Text>
            </View>
          </View>

          {/* Points */}
          <View className="flex-row items-center">
            <Ionicons name="star-outline" size={20} color="#22c55e" className="mr-3" />
            <View>
              <Text className="text-gray-400 text-sm">Current Points</Text>
              <Text className="text-white">{userData.points} pts</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-gray-800 p-4 rounded-lg flex-row items-center justify-center mb-6"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" className="mr-2" />
          <Text className="text-red-400 font-bold">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({})