import React, {useContext} from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; // Импортируем хук навигации
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
  const { user } = useContext(UserContext);


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

      <TouchableOpacity style={styles.button}>
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
  main: {
    backgroundColor: '#e3e3e3',
    flex: 1,
  },
  text: {
    padding: 20,
    borderRadius: 5,
    backgroundColor: '#FFFF',
    margin: 5,
    width: '98%',
    marginLeft: '1%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  mapIcon: {
    position: 'absolute',
    bottom: '1%', // Расстояние от нижней границы
    right: 15, // Расстояние от правой границы
    width: 60, // Ширина круглого контейнера
    height: 60, // Высота круглого контейнера
    borderRadius: 30, // Радиус круглого контейнера (равный половине ширины или высоты)
    backgroundColor: '#4287f5', // Цвет круглого контейнера
    justifyContent: 'center', // Выравнивание текста по центру по вертикали
    alignItems: 'center', // Выравнивание текста по центру по горизонтали
  },
  activeBox: { // активация кнопок (подсветка)
    backgroundColor: '#4287f5',
    color: 'white',
  },
  textButton: {
    color: 'black',
    padding: 5,
    textAlign: 'center',
    borderRadius: 25,
    margin: 5,
  },
  navBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'left',
  },
  box: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  mainButton: {
    backgroundColor: '#ffff',
  },
  lastUpdatedText: {
    textAlign: 'right',
    marginVertical: 5,
    marginRight: 10,
    color: 'gray',
  },
  button: {
    padding: 20,
    borderRadius: 5,
    backgroundColor: '#FFFF',
    margin: 5,
    width: '98%',
    marginLeft: '1%',
    shadowColor: "#000",
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
    marginLeft: 40, // Отступ для выравнивания под основным текстом
    fontSize: 14,
    color: 'gray',
  },
});