import React, {useState,useEffect, useContext} from 'react';
import {StyleSheet,View, FlatList,SafeAreaView,Text,TouchableOpacity,StatusBar} from 'react-native';
import moment from 'moment'; //формат времени для ленивых
import 'moment/locale/ru';// ru контент
import { ApiUrlContext } from './contexts/ApiUrlContext';


function ActiveWork({data, navigation}) {
  const LoadScene = (item)=>{
    navigation.navigate('О Заявке',{itemData: item});
  }
  const formatDateTime = (dateTime) => {
    return moment(dateTime).format('lll');
  };
  const filterDataByActive = () => {
    return data.filter(item => item.Status === 0);//фильтруем только активные заявки на инженере
  }; 
  return (
    <SafeAreaView style={styles.main}>
    <FlatList data={filterDataByActive()} renderItem={({item}) =>(
      <TouchableOpacity style={styles.text} onPress={() => LoadScene(item)} >
          <Text style={{flexDirection:"row", marginRight: 10}}> 
          <Text >№ Заявки: {item.Number}  </Text>
          <Text style={styles.activeBox}>{item.Service}</Text>
          </Text>
          <Text >Дата создания: {formatDateTime(item.Date)}</Text>
      </TouchableOpacity>
    )}>
    </FlatList>
  </SafeAreaView>

  );
}
function ArchiveWork({data, navigation}) {
  const LoadScene = (item)=>{
    navigation.navigate('О Заявке',{itemData: item});
  }
  const formatDateTime = (dateTime) => {
    return moment(dateTime).format('lll');
  };
  const filterDataByArchive = () => {
    return data.filter(item => item.Status === 1);//фильтруем только архивные заявки на инженере
  };  
  return (
    <SafeAreaView style={styles.main}>
    <FlatList data={filterDataByArchive()} renderItem={({item}) =>(
      <TouchableOpacity style={styles.text} onPress={() => LoadScene(item)} >
          <Text style={{flexDirection:"row", }}> 
          <Text >№ Заявки: {item.Number}  </Text>
          <Text style={styles.activeBox} >{item.Service}</Text>
          </Text>
          <Text >Дата создания: {formatDateTime(item.Date)}</Text>
      </TouchableOpacity>
    )}>
    </FlatList>
  </SafeAreaView>

  );
}




export default function Main({navigation}) {
  const { apiUrl } = useContext(ApiUrlContext);
  const [data, setData] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('ActiveWork');
  useEffect(() => {
    fetchData(); // Вызов функции для получения данных при монтировании компонента
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${apiUrl}/data`); // Запрос к сервису
      const jsonData = await response.json(); // Преобразование ответа в JSON
      setData(jsonData); // Установка полученных данных в состояние компонента
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
    }
  };
  
 


  return (
    
      <View style={styles.container}>
        
        <View style={styles.mainButton}>
          <View style={styles.navBox}> 
              <View style = {styles.box}>
                  <TouchableOpacity onPress={() => setCurrentScreen('ActiveWork')}>
                      <Text style={[styles.textButton, currentScreen === 'ActiveWork' ? styles.activeBox : null]}>Активные</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setCurrentScreen('ArchiveWork')}>
                      <Text style={[styles.textButton, currentScreen === 'ArchiveWork' ? styles.activeBox: null]}>Архивные</Text>
                  </TouchableOpacity>
              </View>
          </View>
    </View>

        {currentScreen === 'ActiveWork' && <ActiveWork data={data} navigation={navigation}/>}
        {currentScreen === 'ArchiveWork' && <ArchiveWork data={data} navigation={navigation}/>}
        <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
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
    bottom: '1%', // Расстояние от нижней границы
    right: 15, // Расстояние от правой границы
    width: 60, // Ширина круглого контейнера
    height: 60, // Высота круглого контейнера
    borderRadius: 30, // Радиус круглого контейнера (равный половине ширины или высоты)
    backgroundColor: '#4287f5', // Цвет круглого контейнера
    justifyContent: 'center', // Выравнивание текста по центру по вертикали
    alignItems: 'center', // Выравнивание текста по центру по горизонтали
  },
  activeBox:{//активация кнопок(подсветка)
    backgroundColor: '#4287f5',
    color: 'white'
  },
  textButton:{
    color: 'black',
    padding:5,
    textAlign: 'center',
    borderRadius: 25,
    margin: 5
},
navBox: {
  flexDirection:'row',
  alignItems: 'center',
  justifyContent: 'left',
  
},
box:{
  justifyContent: 'center',
  flexDirection:'row',
},
mainButton:{
  backgroundColor: '#ffff',  
},
});
