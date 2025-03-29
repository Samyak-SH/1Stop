import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Alert, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useNavigate } from 'react-router-native';
import { Ionicons } from '@expo/vector-icons';

// Mock signup service (replace with your actual API)
const signupUser = async (name: string, email: string, password: string) => {
  try {
    // Replace with your actual signup API call
    const response = await fetch('https://your-api.com/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      throw new Error('Signup failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    try {
      await signupUser(name, email, password);
      Alert.alert(
        'Success', 
        'Account created successfully', 
        [{ text: 'OK', onPress: () => navigate('/login') }]
      );
    } catch (error) {
      Alert.alert('Signup Failed', 'Could not create account. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 justify-center p-6">
              <View className="items-center mb-10">
                <Text className="text-3xl font-bold text-white tracking-wider">1STOP</Text>
                <Text className="text-base text-gray-300 mt-2">Your one stop solution</Text>
              </View>
              
              <View className="w-full">
                <Text className="text-2xl font-bold text-white mb-2">Create Account</Text>
                <Text className="text-base text-gray-300 mb-6">Sign up to get started</Text>
                
                <View className="flex-row items-center bg-gray-900 rounded-xl mb-4 px-4 h-14 border border-gray-800">
                  <Ionicons name="person-outline" size={24} color="#9ca3af" className="mr-3" />
                  <TextInput
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                    className="flex-1 text-base text-white"
                    autoCapitalize="words"
                    placeholderTextColor="#6b7280"
                  />
                </View>
                
                <View className="flex-row items-center bg-gray-900 rounded-xl mb-4 px-4 h-14 border border-gray-800">
                  <Ionicons name="mail-outline" size={24} color="#9ca3af" className="mr-3" />
                  <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    className="flex-1 text-base text-white"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#6b7280"
                  />
                </View>
                
                <View className="flex-row items-center bg-gray-900 rounded-xl mb-4 px-4 h-14 border border-gray-800">
                  <Ionicons name="lock-closed-outline" size={24} color="#9ca3af" className="mr-3" />
                  <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    className="flex-1 text-base text-white"
                    secureTextEntry={!isPasswordVisible}
                    placeholderTextColor="#6b7280"
                  />
                  <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} className="p-1">
                    <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row items-center bg-gray-900 rounded-xl mb-6 px-4 h-14 border border-gray-800">
                  <Ionicons name="shield-checkmark-outline" size={24} color="#9ca3af" className="mr-3" />
                  <TextInput
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    className="flex-1 text-base text-white"
                    secureTextEntry={!isConfirmPasswordVisible}
                    placeholderTextColor="#6b7280"
                  />
                  <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} className="p-1">
                    <Ionicons name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  onPress={handleSignup} 
                  activeOpacity={0.8}
                  className="h-14 rounded-xl justify-center items-center mb-6 bg-white"
                >
                  <Text className="text-black text-base font-bold">Create Account</Text>
                </TouchableOpacity>
                
                <View className="flex-row items-center mb-6">
                  <View className="flex-1 h-[1px] bg-gray-700" />
                  <Text className="mx-4 text-gray-400">or</Text>
                  <View className="flex-1 h-[1px] bg-gray-700" />
                </View>
                
                <TouchableOpacity 
                  activeOpacity={0.8}
                  className="h-14 rounded-xl justify-center items-center mb-6 bg-gray-900 border border-gray-700 flex-row"
                >
                  <Ionicons name="logo-google" size={20} color="#fff" />
                  <Text className="text-white text-base font-medium ml-3">Continue with Google</Text>
                </TouchableOpacity>
                
                <View className="flex-row justify-center">
                  <Text className="text-sm text-gray-300">Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigate('/login')}>
                    <Text className="text-sm text-green-500 font-bold">Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
