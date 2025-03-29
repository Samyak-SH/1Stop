import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigate } from 'react-router-native';
import { useAuth } from '../(tabs)/AuthContext';

// Constant test credentials
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

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
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      const token = await loginUser(email, password);
      await login(token);
      navigate('/');  // Navigate to the root which should render the tabs layout
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button 
        title="Sign Up" 
        onPress={() => navigate('/signup')} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});