import React, { useState, useEffect, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Image, Text, Alert, StatusBar } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { ApiUrlContext } from './contexts/ApiUrlContext';

const LoginScreen = ({ navigation }) => {
  const { apiUrl, toggleApiUrl } = useContext(ApiUrlContext);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    checkLoggedIn(); 
  }, []);

  const checkLoggedIn = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setLoggedIn(true);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      console.error('Error checking logged in status:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const token = await loginUser(phoneNumber, password);
      await AsyncStorage.setItem('token', token);
      setLoggedIn(true);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Error logging in:', error);
      let errorMessage = 'Не удалось подключиться к серверу. Проверьте ваше интернет-соединение и повторите попытку.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage += `\nКод ошибки: ${error.response.data.error}`;
      }
      Alert.alert('Ошибка', errorMessage);
    }
  };

  const loginUser = async (phoneNumber, password) => {
    try {
      const response = await axios.post(`${apiUrl}/login`, {
        phoneNumber: phoneNumber,
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data.token;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Сменить сервер" onPress={toggleApiUrl} />
      <Text>URL - Server: Local192-VPS:178: {apiUrl}</Text>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />
      {!loggedIn && (
        <>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholder="Введите номер телефона"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder="Введите пароль"
          />
          <Button title="Вход" onPress={handleLogin} />
        </>
      )}
      {loggedIn && (
        <Text>Вы уже авторизованы.</Text>
      )}
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  logo: {
    width: '100%',
    height: 150,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});

export default LoginScreen;