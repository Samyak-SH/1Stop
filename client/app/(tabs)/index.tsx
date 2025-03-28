import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useRef, useState, useCallback, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import MyMap, { MyMapRef } from "@/components/MyMap";

const Bus = () => {
  const mapRef = useRef<MyMapRef>(null);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [formState, setFormState] = useState({
    fromLocation: "",
    toLocation: ""
  });
  const [routeConfirmed, setRouteConfirmed] = useState(false);

  // Separate state update functions
  const handleFromChange = useCallback((text: string) => {
    setFormState(prev => ({ ...prev, fromLocation: text }));
  }, []);

  const handleToChange = useCallback((text: string) => {
    setFormState(prev => ({ ...prev, toLocation: text }));
  }, []);

  const handleConfirmRoute = useCallback(() => {
    if (formState.fromLocation && formState.toLocation) {
      Keyboard.dismiss();
      setSearchModalVisible(false);
      setRouteConfirmed(true);
    }
  }, [formState]);

  const handleEditRoute = useCallback(() => {
    setSearchModalVisible(true);
  }, []);

  const openSearchModal = useCallback(() => {
    setSearchModalVisible(true);
  }, []);

  const closeSearchModal = useCallback(() => {
    Keyboard.dismiss();
    setSearchModalVisible(false);
  }, []);

  // Extract common view elements for reuse
  const mapSection = useMemo(() => (
    <View className="w-full h-1/2 bg-gray-900 justify-center items-center">
      <MyMap ref={mapRef} />
    </View>
  ), []);

  const locateButton = useMemo(() => (
    <TouchableOpacity
      className="absolute right-4 bottom-[51%] bg-black p-3 rounded-full shadow-lg"
      onPress={() => mapRef.current?.locateMe()}
    >
      <Ionicons name="locate" size={24} color="#22c55e" />
    </TouchableOpacity>
  ), []);

  // If route is confirmed, show the route view
  if (routeConfirmed) {
    return (
      <View className="flex-1 bg-black">
        {mapSection}
        {locateButton}

        <View className="w-full h-1/2 bg-black p-4">
          <View className="bg-gray-900 border border-gray-800 p-4 rounded-lg mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-lg font-semibold text-white">Your Route</Text>
              <TouchableOpacity onPress={handleEditRoute} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Ionicons name="pencil" size={20} color="#22c55e" />
              </TouchableOpacity>
            </View>
            
            <View className="mb-2">
              <Text className="text-gray-400">From</Text>
              <Text className="text-white">{formState.fromLocation}</Text>
            </View>
            
            <View>
              <Text className="text-gray-400">To</Text>
              <Text className="text-white">{formState.toLocation}</Text>
            </View>
            
            <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-800">
              <Text className="text-green-500">Est. Distance: 5.2km</Text>
              <Text className="text-green-500">Est. Time: 30 mins</Text>
            </View>
          </View>
          
          <View className="flex-1">
            <Text className="text-lg font-semibold text-green-500 mb-2">
              Suggested Routes
            </Text>
            <ScrollView className="flex-1">
              {[1, 2, 3].map((item) => (
                <TouchableOpacity
                  key={item}
                  className="bg-gray-900 border border-gray-800 p-3 mb-3 rounded-lg"
                >
                  <Text className="font-medium text-white">Route Option {item}</Text>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-green-600">5.2km</Text>
                    <Text className="text-green-600">30 mins</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        
        {/* Modal placed at the end of the component */}
        {searchModalVisible && (
          <Modal
            animationType="slide"
            transparent={false}
            visible={true}
            onRequestClose={closeSearchModal}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="flex-1"
            >
              <SafeAreaView className="flex-1 bg-black pt-10">
                <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
                  <TouchableOpacity
                    onPress={closeSearchModal}
                    className="mr-4"
                  >
                    <Ionicons name="arrow-back" size={24} color="#22c55e" />
                  </TouchableOpacity>
                  <Text className="text-xl font-bold text-white">Plan Your Route</Text>
                </View>

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View className="p-4 space-y-4">
                    <View className="bg-gray-900 border border-gray-800 rounded-lg p-2">
                      <View className="flex-row items-center px-3 py-2">
                        <Ionicons name="location" size={20} color="#22c55e" />
                        <TextInput
                          className="ml-2 flex-1 text-white"
                          placeholder="From location"
                          placeholderTextColor="gray"
                          value={formState.fromLocation}
                          onChangeText={handleFromChange}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    </View>

                    <View className="bg-gray-900 border border-gray-800 rounded-lg p-2">
                      <View className="flex-row items-center px-3 py-2">
                        <Ionicons name="navigate" size={20} color="#22c55e" />
                        <TextInput
                          className="ml-2 flex-1 text-white"
                          placeholder="To location"
                          placeholderTextColor="gray"
                          value={formState.toLocation}
                          onChangeText={handleToChange}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      className={`p-3 rounded-lg mt-4 ${
                        !formState.fromLocation || !formState.toLocation ? "bg-gray-600" : "bg-green-600"
                      }`}
                      onPress={handleConfirmRoute}
                      disabled={!formState.fromLocation || !formState.toLocation}
                    >
                      <Text className="text-white font-bold text-center">Confirm Route</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </SafeAreaView>
            </KeyboardAvoidingView>
          </Modal>
        )}
      </View>
    );
  }

  // Default view (when no route is confirmed)
  return (
    <View className="flex-1 bg-black">
      {mapSection}
      {locateButton}

      <View className="w-full h-1/2 bg-black p-4">
        <View className="w-full mb-4">
          <TouchableOpacity
            className="flex-row items-center bg-gray-900 border border-gray-800 px-3 py-2 rounded-lg"
            onPress={openSearchModal}
          >
            <Ionicons name="search" size={20} color="#22c55e" />
            <Text className="ml-2 flex-1 text-gray-400">Search destinations...</Text>
          </TouchableOpacity>
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
      
      {/* Modal placed at the end of the component */}
      {searchModalVisible && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={true}
          onRequestClose={closeSearchModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <SafeAreaView className="flex-1 bg-black pt-10">
              <View className="px-4 py-3 flex-row items-center border-b border-gray-800">
                <TouchableOpacity
                  onPress={closeSearchModal}
                  className="mr-4"
                >
                  <Ionicons name="arrow-back" size={24} color="#22c55e" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-white">Plan Your Route</Text>
              </View>

              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="p-4 space-y-4">
                  <View className="bg-gray-900 border border-gray-800 rounded-lg p-2">
                    <View className="flex-row items-center px-3 py-2">
                      <Ionicons name="location" size={20} color="#22c55e" />
                      <TextInput
                        className="ml-2 flex-1 text-white"
                        placeholder="From location"
                        placeholderTextColor="gray"
                        value={formState.fromLocation}
                        onChangeText={handleFromChange}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  <View className="bg-gray-900 border border-gray-800 rounded-lg p-2">
                    <View className="flex-row items-center px-3 py-2">
                      <Ionicons name="navigate" size={20} color="#22c55e" />
                      <TextInput
                        className="ml-2 flex-1 text-white"
                        placeholder="To location"
                        placeholderTextColor="gray"
                        value={formState.toLocation}
                        onChangeText={handleToChange}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    className={`p-3 rounded-lg mt-4 ${
                      !formState.fromLocation || !formState.toLocation ? "bg-gray-600" : "bg-green-600"
                    }`}
                    onPress={handleConfirmRoute}
                    disabled={!formState.fromLocation || !formState.toLocation}
                  >
                    <Text className="text-white font-bold text-center">Confirm Route</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
};

export default Bus;

const styles = StyleSheet.create({});
