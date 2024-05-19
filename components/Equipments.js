import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text, FlatList, RefreshControl } from 'react-native';
import { ApiUrlContext } from './contexts/ApiUrlContext';

export default function Equip() {
  const { apiUrl } = useContext(ApiUrlContext);
  const [data, setData] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch(`${apiUrl}/equipment-data`); // Запрос к сервису
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const jsonData = await response.json(); // Преобразование ответа в JSON
      setData(jsonData); // Установка полученных данных в состояние компонента
      setIsConnected(true);
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      setIsConnected(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.main}>
        {!isConnected && <Text style={styles.error}>Нет соединения с сервером</Text>}
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <View style={styles.text}>
              <Text>Оборудование: {item.Name}</Text>
              <Text>Серийный номер: {item.SN}</Text>
            </View>
          )}
          keyExtractor={(item) => item.idEquipment.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      </SafeAreaView>
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    margin: 10,
  },
});