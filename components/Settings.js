import React, { useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { UserContext } from './contexts/UserContext';

const clearToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
    console.log('Токен успешно удален');
  } catch (error) {
    console.error('Ошибка при удалении токена:', error);
  }
};

export default function Settings() {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);

  const handleLogout = async () => {
    await clearToken();
    console.log('Токен очищен');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View>
      <TouchableOpacity style={styles.button}>
        <View style={styles.iconTextContainer}>
          <AntDesign name="user" size={30} />
          <Text style={styles.text}>Пользователь {user.FIO}</Text>
        </View>
        <Text style={styles.subText}>ID пользователя {user.id}</Text>
        <Text style={styles.subText}>номер телефона {user.phone}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Смена Пароля')}>
        <View style={styles.iconTextContainer}>
          <AntDesign name="lock" size={30} />
          <Text style={styles.text}>Смена пароля</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <View style={styles.iconTextContainer}>
          <AntDesign name="form" size={30} />
          <Text style={styles.text}>Графическая подпись</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <View style={styles.iconTextContainer}>
          <AntDesign name="logout" size={30} />
          <Text style={styles.text}>Выход</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    padding: 20,
    borderRadius: 5,
    backgroundColor: '#FFFF',
    margin: 5,
    width: '98%',
    marginLeft: '1%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginLeft: 10,
    fontSize: 18,
  },
  subText: {
    marginLeft: 40,
    fontSize: 14,
    color: 'gray',
  },
});