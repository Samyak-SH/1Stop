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

// import { SERVER_URL, GOOGLE_API_KEY } from "@env";
import { getUID } from "@/data/uidController";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { resolvePath } from "react-router-native";

const SERVER_URL = ""

// Define interface for station data
interface Station {
  name: string;
  coordinates: [number, number];
  line: string;
}

// Define interface for payment card
interface PaymentCard {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

// Define interface for UPI payment
interface UpiPayment {
  upiId: string;
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
  const [showPaymentGateway, setShowPaymentGateway] = useState<boolean>(false);
  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string>("");
  const [cardDetails, setCardDetails] = useState<PaymentCard>({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('upi');
  const [upiDetails, setUpiDetails] = useState<UpiPayment>({
    upiId: "",
  });

  // Fetch booking history from API
  const fetchBookingHistory = async (): Promise<void> => {
    setLoadingHistory(true);
    try {
      // const uid = await getUID();
      const uid = "67e6f810732294a7f6e6d379";
      const response = await axios.get(`${SERVER_URL}/booking-history`, {
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${uid}`,
        },
      });

      // if (!response.ok) {
      //   throw new Error(`Server responded with status: ${response.status}`);
      // }

      // const data: BookingHistory[] = await response.json();
      const data = response.data;
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

      const response = await axios
        .post(`${SERVER_URL}/create-booking`, bookingData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${uid}`,
          },
        })
        .then((response) => {
          console.log("Booking successful:", response.data);
          fetchBookingHistory(); // Refresh booking history after successful booking
        })
        .catch((error) => {
          console.error("Error creating booking:", error);
        })
        .finally(() => {
          console.log("Booking process completed.");
        });
      // if (!response.ok) {
      //   throw new Error(`Server responded with status: ${response.status}`);
      // }

      // Refresh booking history after creating a new booking
      fetchBookingHistory();
      return true;
    } catch (error) {
      console.error("Error creating booking:", error);
      return false;
    }
  };

  // Trigger fare calculation when stations are selected
  useEffect(() => {
    if (fromStationObj && toStationObj) {
      fetchFareFromServer();
    }
  }, [fromStationObj, toStationObj]);

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
    // Instead of immediately creating booking, show payment gateway
    initiatePayment();
  };

  // Format credit card number with spaces
  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format expiry date MM/YY
  const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  // Handle payment gateway input changes
  const handleCardInputChange = (field: keyof PaymentCard, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      // Limit CVV to 3 or 4 digits
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }
    
    setCardDetails({
      ...cardDetails,
      [field]: formattedValue,
    });
  };

  // Handle UPI ID input change
  const handleUpiInputChange = (value: string) => {
    // UPI ID validation - allows alphanumeric characters, period, and @
    const formattedValue = value.replace(/[^a-zA-Z0-9.@]/g, '');
    setUpiDetails({
      ...upiDetails,
      upiId: formattedValue,
    });
  };

  // Process the payment
  const processPayment = () => {
    if (paymentMethod === 'card') {
      // Validate card details
      if (cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
        setPaymentError("Please enter a valid card number");
        return;
      }
      
      if (cardDetails.cardHolder.trim() === '') {
        setPaymentError("Please enter card holder name");
        return;
      }
      
      if (cardDetails.expiryDate.length < 5) {
        setPaymentError("Please enter a valid expiry date");
        return;
      }
      
      if (cardDetails.cvv.length < 3) {
        setPaymentError("Please enter a valid CVV");
        return;
      }
    } else {
      // Validate UPI ID
      const upiRegex = /^[a-zA-Z0-9.-]{2,256}@[a-zA-Z][a-zA-Z]{2,64}$/;
      if (!upiRegex.test(upiDetails.upiId)) {
        setPaymentError("Please enter a valid UPI ID (e.g., name@upi)");
        return;
      }
    }

    setPaymentError("");
    setPaymentProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // 90% chance of success for demonstration
      const isSuccess = Math.random() < 0.9;
      
      setPaymentProcessing(false);
      
      if (isSuccess) {
        setPaymentSuccess(true);
        // Complete booking after 1.5 seconds
        setTimeout(() => {
          completeBookingAfterPayment();
        }, 1500);
      } else {
        if (paymentMethod === 'upi') {
          setPaymentError("UPI payment failed. Please check your UPI ID and try again.");
        } else {
          setPaymentError("Transaction declined. Please try another card.");
        }
      }
    }, 2000);
  };

  // Complete the booking after successful payment
  const completeBookingAfterPayment = async () => {
    const success = await createBooking();
    
    setShowPaymentGateway(false);
    setPaymentSuccess(false);
    
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
      // Reset card details
      setCardDetails({
        cardNumber: "",
        cardHolder: "",
        expiryDate: "",
        cvv: "",
      });
      // Reset UPI details
      setUpiDetails({
        upiId: "",
      });
      // Reset payment method to default
      setPaymentMethod('upi');
    } else {
      setErrorMessage("Booking failed. Please try again.");
    }
  };

  // Initiate payment flow
  const initiatePayment = () => {
    setShowPaymentGateway(true);
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

          <TouchableOpacity
            className={`p-4 rounded-lg mb-6 shadow-md flex-row justify-center items-center ${
              fromStationObj && toStationObj ? "bg-green-600" : "bg-gray-600"
            }`}
            onPress={handleBookTicketPress}
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
            {/* Booking History Toggle */}
          <TouchableOpacity 
             className='flex-row items-center justify-between p-4 bg-gray-900 rounded-lg mb-2 shadow-md'
             onPress={() => setShowHistory(!showHistory)}
           >
             <View className='flex-row items-center'>
               <MaterialCommunityIcons name="history" size={22} color="#64748b" style={{marginRight: 10}} />
               <Text className='text-white font-bold'>Booking History</Text>
             </View>
             <Ionicons name={showHistory ? "chevron-up" : "chevron-down"} size={22} color="#64748b" />
           </TouchableOpacity>
 
           {/* Booking History Section */}
           {showHistory && (
             <View className='bg-gray-900 rounded-lg p-1 mb-6 shadow-md'>
               {loadingHistory ? (
                 <View className='p-5 items-center'>
                   <ActivityIndicator size="large" color="#3b82f6" />
                   <Text className='text-gray-400 mt-2'>Loading history...</Text>
                 </View>
               ) : bookingHistory.length > 0 ? (
                 bookingHistory.map((booking) => (
                   <View key={booking.id} className='p-3 border-b border-gray-800 mx-2'>
                     <View className='flex-row justify-between mb-2'>
                       <Text className='text-white font-bold'>{booking.date}</Text>
                       <Text className='text-green-500 font-bold'>₹{booking.fare}</Text>
                     </View>
 
                     <View className='flex-row items-center'>
                       <View className='items-center mr-3'>
                         <View style={{
                           width: 10,
                           height: 10,
                           borderRadius: 5,
                           backgroundColor: getLineColor(booking.fromLine)
                         }} />
                         <View className='h-6 w-0.5 bg-gray-700' />
                         <View style={{
                           width: 10,
                           height: 10,
                           borderRadius: 5,
                           backgroundColor: getLineColor(booking.toLine)
                         }} />
                       </View>
 
                       <View className='flex-1'>
                         <Text className='text-white'>{booking.fromStation}</Text>
                         <Text className='text-white'>{booking.toStation}</Text>
                       </View>
 
                       <View className='flex-row items-center'>
                         <FontAwesome5 name="user" size={12} color="#64748b" />
                         <Text className='text-gray-400 ml-1'>x{booking.passengers}</Text>
                       </View>
                     </View>
                   </View>
                 ))
               ) : (
                 <View className='p-5 items-center'>
                   <Text className='text-gray-400'>No booking history found</Text>
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
                      <Text className="text-white mt-1">{duration}</Text>
                      <Text className="text-gray-400 text-xs">Duration</Text>
                    </View>

                    <View className="items-center">
                      <FontAwesome5 name="route" size={16} color="#64748b" />
                      <Text className="text-white mt-1">10 km</Text>
                      <Text className="text-gray-400 text-xs">Distance</Text>
                      <Text className="text-white mt-1">{distance}</Text>
                      <Text className="text-gray-400 text-xs">Distance</Text>
                    </View>
                  </View>
                </View>

                {/* Payment Summary */}
                <View className="mb-6">
                  <Text className="text-white font-bold text-lg mb-2">
                    Fare Breakdown
                  </Text>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-300">Base Fare</Text>
                    <Text className="text-gray-300">{fare}</Text>
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-300">Passengers</Text>
                    <Text className="text-gray-300">x {numPeople}</Text>
                  </View>
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

          {/* Payment Gateway Modal */}
          <Modal visible={showPaymentGateway} animationType="slide" transparent={true}>
            <View className="flex-1 justify-center items-center bg-black bg-opacity-80">
              <View className="bg-gray-900 p-6 rounded-lg w-11/12 max-w-md">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-white text-xl font-bold">
                    {paymentProcessing ? "Processing Payment" : 
                     paymentSuccess ? "Payment Successful" : "Payment Gateway"}
                  </Text>
                  {!paymentProcessing && !paymentSuccess && (
                    <TouchableOpacity
                      className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center"
                      onPress={() => setShowPaymentGateway(false)}
                    >
                      <Ionicons name="close" size={18} color="white" />
                    </TouchableOpacity>
                  )}
                </View>

                {paymentProcessing ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="text-white mt-4 text-center">
                      Processing your payment...
                    </Text>
                    <Text className="text-gray-400 mt-2 text-center">
                      Please do not close this window
                    </Text>
                  </View>
                ) : paymentSuccess ? (
                  <View className="items-center py-8">
                    <View className="h-16 w-16 rounded-full bg-green-500 items-center justify-center mb-4">
                      <Ionicons name="checkmark" size={40} color="white" />
                    </View>
                    <Text className="text-white text-lg font-bold mb-2 text-center">
                      Payment Successful!
                    </Text>
                    <Text className="text-gray-400 text-center">
                      Your booking is being confirmed...
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Payment Method Selector */}
                    <View className="flex-row mb-6 bg-gray-800 rounded-lg p-1">
                      <TouchableOpacity 
                        className={`flex-1 p-3 rounded-md ${paymentMethod === 'upi' ? 'bg-blue-600' : 'bg-transparent'}`}
                        onPress={() => setPaymentMethod('upi')}
                      >
                        <Text className={`text-center ${paymentMethod === 'upi' ? 'text-white font-bold' : 'text-gray-400'}`}>UPI</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className={`flex-1 p-3 rounded-md ${paymentMethod === 'card' ? 'bg-blue-600' : 'bg-transparent'}`}
                        onPress={() => setPaymentMethod('card')}
                      >
                        <Text className={`text-center ${paymentMethod === 'card' ? 'text-white font-bold' : 'text-gray-400'}`}>Card</Text>
                      </TouchableOpacity>
                    </View>

                    {paymentMethod === 'upi' ? (
                      <>
                        {/* UPI Payment UI */}
                        <View className="mb-4">
                          <Text className="text-white text-center mb-4">Enter your UPI ID to pay ₹{calculateTotalFare()}</Text>
                          
                          <Text className="text-gray-400 text-xs mb-1">UPI ID</Text>
                          <TextInput
                            className="bg-gray-800 text-white p-3 rounded-lg mb-4"
                            value={upiDetails.upiId}
                            onChangeText={handleUpiInputChange}
                            placeholder="yourname@upi"
                            placeholderTextColor="#666"
                            autoCapitalize="none"
                          />
                          
                          {/* UPI App Icons */}
                          <Text className="text-gray-400 text-xs mb-3 text-center">Popular UPI Apps</Text>
                          <View className="flex-row justify-center mb-6">
                            {/* We're using FontAwesome icons as placeholders - in a real app, you'd use proper UPI app images */}
                            <View className="items-center mx-2">
                              <View className="h-10 w-10 bg-green-600 rounded-full items-center justify-center mb-1">
                                <FontAwesome5 name="phone-alt" size={20} color="white" />
                              </View>
                              <Text className="text-gray-400 text-xs">PhonePe</Text>
                            </View>
                            <View className="items-center mx-2">
                              <View className="h-10 w-10 bg-blue-600 rounded-full items-center justify-center mb-1">
                                <FontAwesome5 name="google" size={20} color="white" />
                              </View>
                              <Text className="text-gray-400 text-xs">Google Pay</Text>
                            </View>
                            <View className="items-center mx-2">
                              <View className="h-10 w-10 bg-purple-600 rounded-full items-center justify-center mb-1">
                                <FontAwesome5 name="rupee-sign" size={20} color="white" />
                              </View>
                              <Text className="text-gray-400 text-xs">Paytm</Text>
                            </View>
                            <View className="items-center mx-2">
                              <View className="h-10 w-10 bg-yellow-600 rounded-full items-center justify-center mb-1">
                                <Ionicons name="wallet" size={20} color="white" />
                              </View>
                              <Text className="text-gray-400 text-xs">Amazon Pay</Text>
                            </View>
                          </View>
                        </View>
                      </>
                    ) : (
                      <>
                        {/* Card Details Form */}
                        <View className="mb-4">
                          <Text className="text-gray-400 text-xs mb-1">CARD NUMBER</Text>
                          <TextInput
                            className="bg-gray-800 text-white p-3 rounded-lg mb-3"
                            value={cardDetails.cardNumber}
                            onChangeText={(text) => handleCardInputChange('cardNumber', text)}
                            placeholder="1234 5678 9012 3456"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            maxLength={19}
                          />
                          
                          <Text className="text-gray-400 text-xs mb-1">CARD HOLDER NAME</Text>
                          <TextInput
                            className="bg-gray-800 text-white p-3 rounded-lg mb-3"
                            value={cardDetails.cardHolder}
                            onChangeText={(text) => handleCardInputChange('cardHolder', text)}
                            placeholder="John Doe"
                            placeholderTextColor="#666"
                          />
                          
                          <View className="flex-row mb-4">
                            <View className="flex-1 mr-2">
                              <Text className="text-gray-400 text-xs mb-1">EXPIRY DATE</Text>
                              <TextInput
                                className="bg-gray-800 text-white p-3 rounded-lg"
                                value={cardDetails.expiryDate}
                                onChangeText={(text) => handleCardInputChange('expiryDate', text)}
                                placeholder="MM/YY"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                maxLength={5}
                              />
                            </View>
                            <View className="flex-1 ml-2">
                              <Text className="text-gray-400 text-xs mb-1">CVV</Text>
                              <TextInput
                                className="bg-gray-800 text-white p-3 rounded-lg"
                                value={cardDetails.cvv}
                                onChangeText={(text) => handleCardInputChange('cvv', text)}
                                placeholder="123"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                maxLength={4}
                                secureTextEntry
                              />
                            </View>
                          </View>
                        </View>
                        
                        {/* Card Icons */}
                        <View className="flex-row justify-center mb-6">
                          <FontAwesome5 name="cc-visa" size={30} color="#1a1f71" style={{marginHorizontal: 5}} />
                          <FontAwesome5 name="cc-mastercard" size={30} color="#eb001b" style={{marginHorizontal: 5}} />
                          <FontAwesome5 name="cc-amex" size={30} color="#006fcf" style={{marginHorizontal: 5}} />
                          <FontAwesome5 name="cc-discover" size={30} color="#ff6000" style={{marginHorizontal: 5}} />
                        </View>
                      </>
                    )}
                    
                    {paymentError ? (
                      <Text className="text-red-500 text-center mb-4">
                        {paymentError}
                      </Text>
                    ) : null}
                    
                    {/* Payment action button */}
                    <TouchableOpacity
                      className="bg-green-600 p-4 rounded-lg mb-3 flex-row justify-center items-center"
                      onPress={processPayment}
                    >
                      <FontAwesome5
                        name="lock"
                        size={16}
                        color="white"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-white text-center font-bold">
                        Pay ₹{calculateTotalFare()} {paymentMethod === 'upi' ? 'via UPI' : 'Securely'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      className="border border-gray-600 p-3 rounded-lg"
                      onPress={() => setShowPaymentGateway(false)}
                    >
                      <Text className="text-gray-400 text-center">Cancel</Text>
                    </TouchableOpacity>
                  </>
                )}
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
