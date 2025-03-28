import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import MyMap, { MyMapRef } from "@/components/MyMap";

const Bus = () => {
  const mapRef = useRef<MyMapRef>(null);
  return (
    <View className="flex-1 bg-black">
      <View className="w-full h-1/2 bg-gray-900 justify-center items-center">
        <Text className="text-lg font-semibold text-green-500">
          <MyMap ref={mapRef} />
        </Text>
      </View>

      <TouchableOpacity
        className="absolute right-4 bottom-[51%] bg-black p-3 rounded-full shadow-lg"
        onPress={() => mapRef.current?.locateMe()}
      >
        <Ionicons name="locate" size={24} color="#22c55e" />
      </TouchableOpacity>

      <View className="w-full h-1/2 bg-black p-4">
        <View className="w-full mb-4">
          <View className="flex-row items-center bg-gray-900 border border-gray-800 px-3 py-2 rounded-lg">
            <Ionicons name="search" size={20} color="#22c55e" />
            <TextInput
              className="ml-2 flex-1 text-white"
              placeholder="Search destinations..."
              placeholderTextColor="gray"
            />
          </View>
        </View>

        <View className="flex-1">
          <Text className="text-lg font-semibold text-green-500 mb-2">
            Previous Travels
          </Text>
          <ScrollView className="flex-1">
            {[1, 2, 3, 4, 5].map((item) => (
              <View
                key={item}
                className="bg-gray-900 border border-gray-800 p-3 mb-3 rounded-lg"
              >
                <Text className="font-medium text-white">Travel #{item}</Text>
                <Text className="text-gray-300">
                  Destination location • Date
                </Text>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-green-600">5.2km</Text>
                  <Text className="text-green-600">30 mins</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default Bus;

const styles = StyleSheet.create({});
