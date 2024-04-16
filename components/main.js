import React, {useState,useEffect} from 'react';
import {StyleSheet,View, FlatList,SafeAreaView,Text,TouchableOpacity} from 'react-native';
import { FontAwesome} from '@expo/vector-icons';
import moment from 'moment'; //формат времени для ленивых
import 'moment/locale/ru';// ru контент
import Active from './Active';

export default function Main({navigation}) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData(); // Вызов функции для получения данных при монтировании компонента
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://192.168.0.17:3000/data'); // Запрос к вашему API
      const jsonData = await response.json(); // Преобразование ответа в JSON
      setData(jsonData); // Установка полученных данных в состояние компонента
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    }
  };
  
  const LoadScene = (item)=>{
    navigation.navigate('О Заявке',{itemData: item});
  }
  const LoadSceneMaps = ()=>{
    navigation.navigate('Карта');
  }

  const formatDateTime = (dateTime) => {
    return moment(dateTime).format('lll');
  };
  

  return (
      <View style={styles.container}>
        <Active/>
        <SafeAreaView style={styles.main}>
          <FlatList data={data} renderItem={({item}) =>(
            <TouchableOpacity style={styles.text} onPress={() => LoadScene(item)} >
                <Text >№ Заявки: {item.Number}</Text>
                <Text >Дата создания: {formatDateTime(item.Date)}</Text>
                
            </TouchableOpacity>
          )}>
          </FlatList>
        </SafeAreaView>
        <TouchableOpacity
          style={styles.mapIcon}
          onPress={() => LoadSceneMaps()}
        >
          <Text style={styles.mapIcon_Set}><FontAwesome name="map-marker" size={40} color="white"/></Text>
          
        </TouchableOpacity>
      </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main:{
    backgroundColor:'#e3e3e3',
    flex: 1
  },
  text:{
    padding:20,
    borderRadius:5,
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
    bottom: 15, // Расстояние от нижней границы
    right: 15, // Расстояние от правой границы
    width: 60, // Ширина круглого контейнера
    height: 60, // Высота круглого контейнера
    borderRadius: 30, // Радиус круглого контейнера (равный половине ширины или высоты)
    backgroundColor: '#4287f5', // Цвет круглого контейнера
    justifyContent: 'center', // Выравнивание текста по центру по вертикали
    alignItems: 'center', // Выравнивание текста по центру по горизонтали
  },
  mapIcon_Set:{
  }
});
