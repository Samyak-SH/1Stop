import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  Ionicons,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { stationData } from "@/data/metro";
import axios from "axios";

import { SERVER_URL } from "@env";
import { getUID } from "@/data/uidController";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

// Define interface for station data
interface Station {
  name: string;
  coordinates: [number, number];
  line: string;
}

// Define interface for server response
interface FareResponse {
  fare: number;
  distance: number;
  duration: number;
  message: string;
}

// Define interface for booking history
interface BookingHistory {
  id: string;
  fromStation: string;
  toStation: string;
  date: string;
  passengers: number;
  fare: number;
  fromLine: string;
  toLine: string;
}

// Get line color for UI elements
const getLineColor = (line: string): string => {
  switch (line.toLowerCase()) {
    case "green":
      return "#008000";
    case "purple":
      return "#800080";
    case "yellow":
      return "#FFD700";
    default:
      return "#007BFF";
  }
};

const Metro = () => {
  const [fromStation, setFromStation] = useState<string>("");
  const [toStation, setToStation] = useState<string>("");
  const [numPeople, setNumPeople] = useState<string>("1");
  const [showFromSuggestions, setShowFromSuggestions] =
    useState<boolean>(false);
  const [showToSuggestions, setShowToSuggestions] = useState<boolean>(false);
  const [filteredFromStations, setFilteredFromStations] = useState<Station[]>(
    []
  );
  const [filteredToStations, setFilteredToStations] = useState<Station[]>([]);
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [fromStationObj, setFromStationObj] = useState<Station | null>(null);
  const [toStationObj, setToStationObj] = useState<Station | null>(null);
  const [fare, setFare] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [bookingHistory, setBookingHistory] = useState<BookingHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  // Fetch booking history from API
  const fetchBookingHistory = async (): Promise<void> => {
    setLoadingHistory(true);
    try {
      console.log("Fetching booking history from server...");
      // const uid = await getUID();
      const uid = "67e6f810732294a7f6e6d379";
      const response = await fetch(
        "http://192.168.1.201:8000/booking-history",
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${uid}`,
          },
        }
      );
      //CHECK Maadi
      /*





      */

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data: BookingHistory[] = await response.json();
      setBookingHistory(data);
    } catch (error) {
      console.error("Error fetching booking history:", error);
      // Set empty array on error
      setBookingHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load booking history when component mounts
  useEffect(() => {
    fetchBookingHistory();
  }, []);

  // Add keyboard listeners to detect when keyboard appears/disappears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    // Clean up listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Calculate fare from server
  const fetchFareFromServer = async (): Promise<void> => {
    console.log("server url", SERVER_URL);
    if (!fromStationObj || !toStationObj) return;

    setIsLoading(true);
    setErrorMessage("");
    try {
      const originCoords = `${fromStationObj.coordinates[0]},${fromStationObj.coordinates[1]}`;
      const destCoords = `${toStationObj.coordinates[0]},${toStationObj.coordinates[1]}`;

      const response = await axios.get(`${SERVER_URL}/metrofare`, {
        params: {
          origin: originCoords,
          destination: destCoords,
          numPeople: numPeople,
          transit_mode: "rail",
        },
      });

      const data = response.data;
      console.log(data);

      setFare(data.fare);
      setDistance(data.distance);
      setDuration(data.duration);
    } catch (error) {
      console.error("Error fetching fare heheheh:", error);
      setErrorMessage("Failed to calculate fare. Using estimate instead.");
      // Fallback to simple calculation - base fare
      setFare(30);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new booking
  const createBooking = async (): Promise<boolean> => {
    if (!fromStationObj || !toStationObj) return false;

    try {
      const bookingData = {
        fromStation: fromStationObj.name,
        toStation: toStationObj.name,
        fromLine: fromStationObj.line,
        toLine: toStationObj.line,
        passengers: parseInt(numPeople, 10),
        fare: calculateTotalFare(),
      };
      // const uid = await getUID();
      const uid = "67e6f810732294a7f6e6d379";
      // CONFIRM IT..;.;.;.;.;.;.;
      /*





      */
      const response = await fetch("http://192.168.1.201:8000/create-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      // Refresh booking history after creating a new booking
      fetchBookingHistory();
      return true;
    } catch (error) {
      console.error("Error creating booking:", error);
      return false;
    }
  };

  // Trigger fare calculation when stations are selected
  // useEffect(() => {
  //   if (fromStationObj && toStationObj) {
  //     fetchFareFromServer();
  //   }
  // }, [fromStationObj, toStationObj]);

  // Filter stations based on input
  useEffect(() => {
    if (fromStation.length > 0) {
      const input = fromStation.toLowerCase().trim();
      const filtered = stationData
        .filter((station) => station.name.toLowerCase().includes(input))
        .sort((a, b) => {
          // Prioritize stations that start with the input
          const aStartsWith = a.name.toLowerCase().startsWith(input);
          const bStartsWith = b.name.toLowerCase().startsWith(input);

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          return a.name.localeCompare(b.name); // Alphabetical order as tiebreaker
        });
      setFilteredFromStations(filtered);
    } else {
      setFilteredFromStations([]);
    }
  }, [fromStation]);

  useEffect(() => {
    if (toStation.length > 0) {
      const input = toStation.toLowerCase().trim();
      const filtered = stationData
        .filter((station) => station.name.toLowerCase().includes(input))
        .sort((a, b) => {
          // Prioritize stations that start with the input
          const aStartsWith = a.name.toLowerCase().startsWith(input);
          const bStartsWith = b.name.toLowerCase().startsWith(input);

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          return a.name.localeCompare(b.name); // Alphabetical order as tiebreaker
        });
      setFilteredToStations(filtered);
    } else {
      setFilteredToStations([]);
    }
  }, [toStation]);

  // Update functions to store station objects
  const handleSelectFromStation = (station: Station): void => {
    setFromStation(station.name);
    setFromStationObj(station);
    setShowFromSuggestions(false);
  };

  const handleSelectToStation = (station: Station): void => {
    setToStation(station.name);
    setToStationObj(station);
    setShowToSuggestions(false);
  };

  // Format duration in minutes
  const formatDuration = (): string => {
    const minutes = Math.ceil(duration / 60);
    return `${minutes} min`;
  };

  // Use server fare or calculate fallback
  const calculateFare = (): number => {
    return fare || parseInt(numPeople, 10) * 30;
  };

  // Close dropdowns when tapping outside
  const handleOutsidePress = (): void => {
    setShowFromSuggestions(false);
    setShowToSuggestions(false);
  };

  const handleBookTicketPress = async () => {
    if (fromStationObj && toStationObj && numPeople) {
      await fetchFareFromServer();
      setShowPayment(true);
    }
  };

  // Calculate fare for display (now correctly multiplying by passenger count)
  const calculateTotalFare = (): number => {
    const baseFare = fare || 30;
    return baseFare * parseInt(numPeople, 10);
  };

  // Format duration nicely
  const getEstimatedTime = (): string => {
    if (duration > 0) {
      return formatDuration();
    }
    // Fallback estimate
    return "25 min";
  };

  // Handle successful payment and booking
  const handlePayment = async () => {
    const success = await createBooking();

    if (success) {
      setShowPayment(false);
      // Reset form after successful payment
      setFromStation("");
      setToStation("");
      setFromStationObj(null);
      setToStationObj(null);
      setNumPeople("1");
      setFare(0);
      setDistance(0);
      setDuration(0);
    } else {
      setErrorMessage("Payment failed. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView className="flex-1 bg-black">
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleOutsidePress}
          className="p-4"
        >
          <Text className="text-white text-2xl font-bold mb-6 text-center"></Text>
          {/* Improved Journey Selector UI */}
          <View className="bg-gray-900 rounded-lg p-4 mb-6 shadow-md">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-bold text-lg">
                Plan Your Journey
              </Text>
              <MaterialCommunityIcons
                name="swap-vertical"
                size={24}
                color="#64748b"
              />
            </View>

            {/* From - To Visual Connection */}
            <View className="flex-row mb-1">
              <View className="items-center mr-3 mt-2">
                <View className="h-7 w-7 rounded-full bg-green-500 items-center justify-center z-10">
                  <FontAwesome5 name="dot-circle" size={14} color="white" />
                </View>
                <View className="h-14 w-1 bg-gray-700" />
                <View className="h-7 w-7 rounded-full bg-red-500 items-center justify-center z-10">
                  <FontAwesome5 name="map-marker" size={14} color="white" />
                </View>
              </View>

              <View className="flex-1">
                {/* From Station Input - Improved */}
                <View className="mb-3">
                  <Text className="text-gray-400 text-xs mb-1">FROM</Text>
                  <View className="flex-row bg-gray-800 rounded-lg overflow-hidden">
                    <TextInput
                      className="flex-1 text-white p-3 pl-4"
                      value={fromStation}
                      onChangeText={(text) => setFromStation(text)}
                      placeholder="Enter departure station"
                      placeholderTextColor="#666"
                      onFocus={() => setShowFromSuggestions(true)}
                    />
                    {fromStationObj && (
                      <View
                        style={{
                          width: 8,
                          backgroundColor: getLineColor(fromStationObj.line),
                        }}
                      />
                    )}
                  </View>
                  {showFromSuggestions && filteredFromStations.length > 0 && (
                    <ScrollView
                      className="max-h-40 bg-gray-800 rounded-lg mt-1 shadow-lg"
                      style={{
                        maxHeight: keyboardVisible ? 150 : 160,
                        position: "absolute",
                        width: "100%",
                        top: 72,
                        zIndex: 1000,
                      }}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                    >
                      {filteredFromStations.map((station, index) => (
                        <TouchableOpacity
                          key={index}
                          className="p-3 border-b border-gray-700"
                          onPress={() => handleSelectFromStation(station)}
                        >
                          <View className="flex-row items-center">
                            <View
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: 6,
                                backgroundColor: getLineColor(station.line),
                                marginRight: 8,
                              }}
                            />
                            <Text className="text-white">{station.name}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>

                {/* To Station Input - Improved */}
                <View>
                  <Text className="text-gray-400 text-xs mb-1">TO</Text>
                  <View className="flex-row bg-gray-800 rounded-lg overflow-hidden">
                    <TextInput
                      className="flex-1 text-white p-3 pl-4"
                      value={toStation}
                      onChangeText={(text) => setToStation(text)}
                      placeholder="Enter destination station"
                      placeholderTextColor="#666"
                      onFocus={() => setShowToSuggestions(true)}
                    />
                    {toStationObj && (
                      <View
                        style={{
                          width: 8,
                          backgroundColor: getLineColor(toStationObj.line),
                        }}
                      />
                    )}
                  </View>
                  {showToSuggestions && filteredToStations.length > 0 && (
                    <ScrollView
                      className="max-h-40 bg-gray-800 rounded-lg mt-1 shadow-lg"
                      style={{
                        maxHeight: keyboardVisible ? 150 : 160,
                        position: "absolute",
                        width: "100%",
                        top: 72,
                        zIndex: 1000,
                      }}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                    >
                      {filteredToStations.map((station, index) => (
                        <TouchableOpacity
                          key={index}
                          className="p-3 border-b border-gray-700"
                          onPress={() => handleSelectToStation(station)}
                        >
                          <View className="flex-row items-center">
                            <View
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: 6,
                                backgroundColor: getLineColor(station.line),
                                marginRight: 8,
                              }}
                            />
                            <Text className="text-white">{station.name}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Number of People - Improved UI */}
          <View className="bg-gray-900 rounded-lg p-4 mb-6 shadow-md -z-10">
            <Text className="text-white font-bold text-lg mb-3">
              Passengers
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <FontAwesome5
                  name="users"
                  size={18}
                  color="#64748b"
                  style={{ marginRight: 10 }}
                />
                <Text className="text-white">Number of People</Text>
              </View>
              <View className="flex-row items-center bg-gray-800 rounded-lg">
                <TouchableOpacity
                  className="p-3"
                  onPress={() =>
                    setNumPeople(
                      Math.max(1, parseInt(numPeople) - 1).toString()
                    )
                  }
                >
                  <Ionicons name="remove" size={20} color="white" />
                </TouchableOpacity>
                <TextInput
                  className="w-10 text-white text-center"
                  value={numPeople}
                  onChangeText={(text) => {
                    const value = text.replace(/[^0-9]/g, "");
                    setNumPeople(value === "" ? "1" : value);
                  }}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  className="p-3"
                  onPress={() =>
                    setNumPeople((parseInt(numPeople) + 1).toString())
                  }
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

<<<<<<< HEAD
          {/* Booking Button */}
          <TouchableOpacity
            className={`p-4 rounded-lg mb-6 shadow-md flex-row justify-center items-center ${
              fromStationObj && toStationObj ? "bg-green-600" : "bg-gray-600"
            }`}
            onPress={() => {
              if (fromStationObj && toStationObj && numPeople) {
                setShowPayment(true);
              }
            }}
            disabled={!fromStationObj || !toStationObj}
          >
            <FontAwesome5
              name="ticket-alt"
              size={16}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text className="text-white text-center font-bold text-lg">
              Book Tickets
            </Text>
          </TouchableOpacity>
=======
>>>>>>> 99b95aa38e61014fbecbcc327539c282562069b3

          <TouchableOpacity
<<<<<<< HEAD
            className="flex-row items-center justify-between p-4 bg-gray-900 rounded-lg mb-2 shadow-md"
            onPress={() => setShowHistory(!showHistory)}
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="history"
                size={22}
                color="#64748b"
                style={{ marginRight: 10 }}
              />
              <Text className="text-white font-bold">Booking History</Text>
            </View>
            <Ionicons
              name={showHistory ? "chevron-up" : "chevron-down"}
              size={22}
              color="#64748b"
            />
          </TouchableOpacity>
=======
          className={`p-4 rounded-lg mb-6 shadow-md flex-row justify-center items-center ${fromStationObj && toStationObj ? 'bg-green-600' : 'bg-gray-600'}`}
          onPress={handleBookTicketPress}
          disabled={!fromStationObj || !toStationObj}
        >
          <FontAwesome5 name="ticket-alt" size={16} color="white" style={{ marginRight: 8 }} />
          <Text className='text-white text-center font-bold text-lg'>Book Tickets</Text>
        </TouchableOpacity>
>>>>>>> 99b95aa38e61014fbecbcc327539c282562069b3

          {/* Booking History Section */}
          {showHistory && (
            <View className="bg-gray-900 rounded-lg p-1 mb-6 shadow-md">
              {loadingHistory ? (
                <View className="p-5 items-center">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className="text-gray-400 mt-2">Loading history...</Text>
                </View>
              ) : bookingHistory.length > 0 ? (
                bookingHistory.map((booking) => (
                  <View
                    key={booking.id}
                    className="p-3 border-b border-gray-800 mx-2"
                  >
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-white font-bold">
                        {booking.date}
                      </Text>
                      <Text className="text-green-500 font-bold">
                        ₹{booking.fare}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <View className="items-center mr-3">
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: getLineColor(booking.fromLine),
                          }}
                        />
                        <View className="h-6 w-0.5 bg-gray-700" />
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: getLineColor(booking.toLine),
                          }}
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-white">
                          {booking.fromStation}
                        </Text>
                        <Text className="text-white">{booking.toStation}</Text>
                      </View>

                      <View className="flex-row items-center">
                        <FontAwesome5 name="user" size={12} color="#64748b" />
                        <Text className="text-gray-400 ml-1">
                          x{booking.passengers}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View className="p-5 items-center">
                  <Text className="text-gray-400">
                    No booking history found
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Enhanced Payment Modal */}
          <Modal visible={showPayment} animationType="slide" transparent={true}>
            <View className="flex-1 justify-center items-center bg-black bg-opacity-80">
              <View className="bg-gray-900 p-6 rounded-lg w-4/5 max-w-md">
                {/* Header with close button */}
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-white text-xl font-bold">
                    Payment Gateway
                  </Text>
                  <TouchableOpacity
                    className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center"
                    onPress={() => setShowPayment(false)}
                  >
                    <Ionicons name="close" size={18} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Journey Details with Visual Elements */}
                <View className="bg-gray-800 rounded-lg p-4 mb-6">
                  <Text className="text-white font-bold text-lg mb-3">
                    Journey Details
                  </Text>

                  {/* From-To Visual Connection */}
                  <View className="flex-row mb-4">
                    <View className="items-center mr-4">
                      <View className="h-8 w-8 rounded-full bg-green-500 items-center justify-center">
                        <Ionicons name="location" size={16} color="white" />
                      </View>
                      <View className="h-14 w-1 bg-gray-700" />
                      <View className="h-8 w-8 rounded-full bg-red-500 items-center justify-center">
                        <Ionicons name="location" size={16} color="white" />
                      </View>
                    </View>

                    <View className="flex-1">
                      <View className="mb-3">
                        <Text className="text-gray-400 text-xs">FROM</Text>
                        <View className="flex-row items-center">
                          <Text className="text-white text-lg">
                            {fromStation}
                          </Text>
                          {fromStationObj && (
                            <View
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: getLineColor(
                                  fromStationObj.line
                                ),
                                marginLeft: 8,
                              }}
                            />
                          )}
                        </View>
                      </View>

                      <View className="mt-8">
                        <Text className="text-gray-400 text-xs">TO</Text>
                        <View className="flex-row items-center">
                          <Text className="text-white text-lg">
                            {toStation}
                          </Text>
                          {toStationObj && (
                            <View
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: getLineColor(
                                  toStationObj.line
                                ),
                                marginLeft: 8,
                              }}
                            />
                          )}
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Additional Journey Info */}
                  <View className="flex-row justify-between border-t border-gray-700 pt-3">
                    <View className="items-center">
                      <FontAwesome5 name="users" size={16} color="#64748b" />
                      <Text className="text-white mt-1">{numPeople}</Text>
                      <Text className="text-gray-400 text-xs">Passengers</Text>
                    </View>

                    <View className="items-center">
                      <MaterialIcons name="timer" size={18} color="#64748b" />
<<<<<<< HEAD
                      <Text className="text-white mt-1">
                        {getEstimatedTime()}
                      </Text>
                      <Text className="text-gray-400 text-xs">Duration</Text>
=======
                      <Text className='text-white mt-1'>{duration}</Text>
                      <Text className='text-gray-400 text-xs'>Duration</Text>
>>>>>>> 99b95aa38e61014fbecbcc327539c282562069b3
                    </View>

                    <View className="items-center">
                      <FontAwesome5 name="route" size={16} color="#64748b" />
<<<<<<< HEAD
                      <Text className="text-white mt-1">10 km</Text>
                      <Text className="text-gray-400 text-xs">Distance</Text>
=======
                      <Text className='text-white mt-1'>{distance}</Text>
                      <Text className='text-gray-400 text-xs'>Distance</Text>
>>>>>>> 99b95aa38e61014fbecbcc327539c282562069b3
                    </View>
                  </View>
                </View>

                {/* Payment Summary */}
<<<<<<< HEAD
                <View className="mb-6">
                  <Text className="text-white font-bold text-lg mb-2">
                    Fare Breakdown
                  </Text>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-300">Base Fare</Text>
                    <Text className="text-gray-300">₹30.00</Text>
=======
                <View className='mb-6'>
                  <Text className='text-white font-bold text-lg mb-2'>Fare Breakdown</Text>
                  <View className='flex-row justify-between mb-1'>
                    <Text className='text-gray-300'>Base Fare</Text>
                    <Text className='text-gray-300'>{fare}</Text>
>>>>>>> 99b95aa38e61014fbecbcc327539c282562069b3
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-300">Passengers</Text>
                    <Text className="text-gray-300">x {numPeople}</Text>
                  </View>
<<<<<<< HEAD
                  {parseInt(numPeople, 10) > 3 && (
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-green-500">Group Discount</Text>
                      <Text className="text-green-500">
                        -₹{parseInt(numPeople, 10) * 3}
                      </Text>
                    </View>
                  )}
                  <View className="border-t border-gray-700 my-2" />
                  <View className="flex-row justify-between">
                    <Text className="text-white font-bold">Total Fare</Text>
                    <Text className="text-white font-bold">
                      ₹{calculateTotalFare()}
                    </Text>
=======
                  <View className='border-t border-gray-700 my-2' />
                  <View className='flex-row justify-between'>
                    <Text className='text-white font-bold'>Total Fare</Text>
                    <Text className='text-white font-bold'>₹{calculateTotalFare()}</Text>
>>>>>>> 99b95aa38e61014fbecbcc327539c282562069b3
                  </View>
                </View>

                {/* Payment Buttons */}
                <TouchableOpacity
                  className="bg-blue-600 p-4 rounded-lg mb-3 flex-row justify-center items-center"
                  onPress={handlePayment}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <FontAwesome5
                        name="credit-card"
                        size={16}
                        color="white"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-white text-center font-bold">
                        Pay ₹{calculateTotalFare()}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {errorMessage ? (
                  <Text className="text-red-500 text-center mb-3">
                    {errorMessage}
                  </Text>
                ) : null}

                <TouchableOpacity
                  className="border border-gray-600 p-3 rounded-lg"
                  onPress={() => setShowPayment(false)}
                >
                  <Text className="text-gray-400 text-center">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Metro;

const styles = StyleSheet.create({});
