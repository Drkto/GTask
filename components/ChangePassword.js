import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
} from "react-native";
import axios from "axios";
import { UserContext } from "./contexts/UserContext";
import { ApiUrlContext } from "./contexts/ApiUrlContext";

const ChangePassword = () => {
  const { apiUrl } = useContext(ApiUrlContext);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { user } = useContext(UserContext);
  const [buttonAnimation] = useState(new Animated.Value(1));

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar
    );
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Ошибка", "Новый пароль и подтверждение пароля не совпадают");
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        "Ошибка",
        "Пароль должен содержать минимум 8 символов, включать заглавные и строчные буквы, цифры и специальные символы"
      );
      return;
    }

    try {
      // Начать анимацию
      Animated.timing(buttonAnimation, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const response = await axios.post(`${apiUrl}/change-password`, {
        userId: user.id,
        oldPassword,
        newPassword,
      });

      if (response.status === 200) {
        Alert.alert("Успех", "Пароль успешно изменен");
      } else {
        const errorMessage =
          response.data?.error || "Не удалось изменить пароль";
        Alert.alert("Ошибка", errorMessage);
      }
    } catch (error) {
      console.error("Ошибка при смене пароля:", error);
      const errorMessage =
        error.response?.data?.error || "Произошла ошибка при смене пароля";
      Alert.alert("Ошибка", errorMessage);
    } finally {
      // Завершить анимацию
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };
  // Стили для анимации кнопки
  const buttonStyle = {
    transform: [{ scale: buttonAnimation }],
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Старый пароль"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Новый пароль"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Повторить пароль"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity
        style={[styles.button, buttonStyle]}
        onPress={handleChangePassword}
      >
        <Text style={styles.buttonText}>Сменить пароль</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e3e3e3",
    flex: 1,
    padding: 10,
  },
  formContainer: {
    width: "80%",
    alignItems: "center",
    paddingTop: 50, // Отступ сверху для размещения формы
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    width: "100%",
    height: 40,
    backgroundColor: "#4287f5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ChangePassword;
