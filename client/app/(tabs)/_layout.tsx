import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AuthProvider } from './AuthContext';
import { NativeRouter, Route, Routes } from 'react-router-native';
import { ProtectedRoute } from './ProtectedRoute';
import { HapticTab } from '@/components/HapticTab';
import { LoginPage } from '../(auth)/login';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <NativeRouter>
        <Routes>
          {/* Change this route path */}
          <Route path="/login" element={<LoginPage />} />
          {/* Or add an additional route that also points to LoginPage */}
          <Route path="/(auth)/login" element={<LoginPage />} />
          {/* <Route path="/signup" element={<SignupPage />} /> */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                  <Tabs
                    screenOptions={{
                      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                      headerShown: false,
                      tabBarButton: HapticTab,
                      tabBarBackground: TabBarBackground,
                      tabBarStyle: Platform.select({
                        ios: {
                          // Use a transparent background on iOS to show the blur effect
                          position: 'absolute',
                          backgroundColor: 'transparent',
                        },
                        default: {},
                      }),
                    }}>
                    <Tabs.Screen
                      name="index"
                      options={{
                        title: 'Bus',
                        tabBarIcon: ({ color, size }) => (
                          <Ionicons name="bus-outline" size={size} color={color} />
                        ),
                      }}
                    />
                    <Tabs.Screen
                      name="metro"
                      options={{
                        title: 'Metro',
                        tabBarIcon: ({ color, size }) => (
                          <Ionicons name="train-outline" size={size} color={color} />
                        ),
                      }}
                    />
                      <Tabs.Screen
                        name="redeem"
                        options={{
                          title: 'Redeem',
                          tabBarIcon: ({ color, size }) => (
                            <Ionicons name="gift-outline" size={size} color={color} />
                          ),
                        }}
                      />
                    
                    <Tabs.Screen
                      name="ev"
                      options={{
                        title: 'EV',
                        tabBarIcon: ({ color, size }) => (
                          <Ionicons name="car-outline" size={size} color={color} />
                        ),
                      }}
                    />
                    <Tabs.Screen
                      name="house"
                      options={{
                        title: 'House',
                        tabBarIcon: ({ color, size }) => (
                          <Ionicons name="business-outline" size={size} color={color} />
                        ),
                      }}
                    /> 
                  
                  </Tabs>
                {/* Your existing tab navigation */}
              </ProtectedRoute>
            } 
          />
        </Routes>
      </NativeRouter>
    </AuthProvider>
  );
}