import React, {useState,useEffect} from 'react';
import {StyleSheet,View, FlatList,SafeAreaView,Text,TouchableOpacity } from 'react-native';
import moment from 'moment'; //формат времени для ленивых
import 'moment/locale/ru';// ru контент


import Active from './Active';

export default function Archive() {
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
    navigation.navigate('О заявке', {itemData: item});
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
  
});
