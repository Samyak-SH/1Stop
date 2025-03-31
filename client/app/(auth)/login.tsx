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
  SafeAreaView
} from 'react-native';
import { useNavigate } from 'react-router-native';
import { useAuth } from '../(tabs)/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// Constant test credentials
const TEST_EMAIL = 'rudraksharss@gmail.com';
const TEST_PASSWORD = 'varanasi0542';

// Mock authentication service (replace with your actual API)
const loginUser = async (email: string, password: string) => {
  try {
    // For testing, accept the test credentials without API call
    if (email === TEST_EMAIL && password === TEST_PASSWORD) {
      return 'test-token-12345';
    }
    
    // Replace with your actual authentication API call
    const response = await fetch('https://your-api.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    throw error;
  }
};

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(TEST_EMAIL);
  const [password, setPassword] = useState(TEST_PASSWORD);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const token = await loginUser(email, password);
      await login(token);
      navigate('/');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid credentials');
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
          <View className="flex-1 justify-center p-6">
            <View className="items-center mb-10">
              <Text className="text-3xl font-bold text-white tracking-wider">1STOP</Text>
              <Text className="text-base text-gray-300 mt-2">Your one stop solution</Text>
            </View>
            
            <View className="w-full">
              <Text className="text-2xl font-bold text-white mb-2">Welcome Back!</Text>
              <Text className="text-base text-gray-300 mb-6">Sign in to continue</Text>
              
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
              
              <TouchableOpacity className="self-end mb-6">
                <Text className="text-green-500 text-sm">Forgot Password?</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleLogin} 
                activeOpacity={0.8}
                className="h-14 rounded-xl justify-center items-center mb-6 bg-white"
              >
                <Text className="text-black text-base font-bold">Sign In</Text>
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
                <Text className="text-sm text-gray-300">Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigate('/signup')}>
                  <Text className="text-sm text-green-500 font-bold">Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginPage;