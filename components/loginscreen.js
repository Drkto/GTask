import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Image,
  Text,
  Alert,
  StatusBar,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiUrlContext } from "./contexts/ApiUrlContext";
import { UserContext } from "./contexts/UserContext";
import NetInfo from "@react-native-community/netinfo";

const LoginScreen = ({ navigation }) => {
  const { apiUrl } = useContext(ApiUrlContext);
  const { setUser } = useContext(UserContext);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleChangeText = (text) => {
    let cleanedText = text.replace(/\s+/g, "");
    if (cleanedText.length > 11) {
      cleanedText = cleanedText.slice(0, 11);
    }
    setPhoneNumber(cleanedText);
  };

  useEffect(() => {
    checkLoggedIn();
  }, []);

  const checkLoggedIn = async () => {
    try {
      const state = await NetInfo.fetch();
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");
      if (token && user) {
        const parsedUser = JSON.parse(user);
        if (state.isConnected) {
          const isActive = await checkUserStatus(parsedUser.id);
          if (isActive) {
            setUser(parsedUser);
            setLoggedIn(true);
            navigation.reset({
              index: 0,
              routes: [{ name: "Main" }],
            });
          } else {
            await logoutUser();
            Alert.alert(
              "Ошибка",
              "Пользователь не активен. Пожалуйста, свяжитесь с менеджером."
            );
          }
        } else {
          // Если нет интернета, используем сохраненные данные
          setUser(parsedUser);
          setLoggedIn(true);
          navigation.reset({
            index: 0,
            routes: [{ name: "Main" }],
          });
        }
      }
    } catch (error) {
      console.error("Error checking logged in status:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await loginUser(phoneNumber, password);
      if (response.token && response.user) {
        await AsyncStorage.setItem("token", response.token);
        await AsyncStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);
        setLoggedIn(true);
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      let errorMessage =
        "Не удалось подключиться к серверу. Проверьте ваше интернет-соединение и повторите попытку.";
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage =
            "Пользователь не активен. Пожалуйста, свяжитесь с менеджером.";
        } else if (error.response.data && error.response.data.error) {
          errorMessage = `Ошибка: ${error.response.data.error}`;
        }
      }
      Alert.alert("Ошибка", errorMessage);
    }
  };

  const loginUser = async (phoneNumber, password) => {
    try {
      const response = await axios.post(
        `${apiUrl}/login`,
        {
          phoneNumber,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error("Missing token or user in response");
      }
      return { token, user };
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const checkUserStatus = async (userId) => {
    try {
      const response = await axios.get(`${apiUrl}/user/status/${userId}`);
      return response.data.status === 1;
    } catch (error) {
      console.error("Error checking user status:", error);
      return false;
    }
  };

  const logoutUser = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null);
    setLoggedIn(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      {!loggedIn && (
        <>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={handleChangeText}
            keyboardType="phone-pad"
            placeholder="Номер телефона"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder="Пароль"
          />
          <Button title="Вход" onPress={handleLogin} />
        </>
      )}
      {loggedIn && <Text>Вы уже авторизованы.</Text>}
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  logo: {
    width: "100%",
    height: 150,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});

export default LoginScreen;
