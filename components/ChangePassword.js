import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { UserContext } from './contexts/UserContext';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { user } = useContext(UserContext);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Ошибка', 'Новый пароль и подтверждение пароля не совпадают');
      return;
    }

    try {
      const response = await axios.post('http://192.168.0.21:3000/change-password', {
        userId: user.id, // Предполагая, что у вас есть идентификатор пользователя в контексте
        oldPassword,
        newPassword
      });

      if (response.status === 200) {
        Alert.alert('Успех', 'Пароль успешно изменен');
      } else {
        Alert.alert('Ошибка', 'Не удалось изменить пароль');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при смене пароля');
    }
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
        placeholder="Подтвердите новый пароль"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title="Сменить пароль" onPress={handleChangePassword} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default ChangePassword;