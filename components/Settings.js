import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // Импортируем хук навигации

const clearToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
    console.log('Токен успешно удален');
  } catch (error) {
    console.error('Ошибка при удалении токена:', error);
  }
};

export default function Settings() {
  const navigation = useNavigation(); // Получаем объект навигации с помощью хука useNavigation

  const handleLogout = async () => {
    await clearToken(); // Вызываем функцию для удаления токена из AsyncStorage
    console.log('Токен очищен');
    // Перенаправляем пользователя на экран входа
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity onPress={handleLogout}>
        <Text>Выход</Text>
      </TouchableOpacity>
    </View>
  );
}