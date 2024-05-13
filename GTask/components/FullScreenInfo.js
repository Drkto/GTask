import React, {useState} from 'react';
import { StyleSheet,Text,ScrollView,View,TouchableOpacity, Image, Button, Alert} from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';

function AttributesComponent() {
  const route = useRoute();
  const { itemData } = route.params;
  return (
    <ScrollView style={styles.main} >
        <Text style={styles.textContainer}>{JSON.stringify(itemData.Description).replace(/\\n/g, '\n')}</Text>
    </ScrollView>
  );
}

function JobsComponent() {
  const [images, setImages] = useState({
    terminal: [],
    serailnumber:[],
    payment: [],
    paymentkey:[],
    cancel: [],
    finalCheck: []
  });


  const pickImage = async (blockName) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });
    console.log(result);
    if (!result.canceled) {
      setImages(prevImages => ({
        ...prevImages,
        [blockName]: [...prevImages[blockName], result.assets[0].uri]
      }));
    }
  };

  const uploadAllImages = async () => {
    try {
      const formData = new FormData();
  
      // Перебираем все блоки изображений
      for (const blockName in images) {
        // Перебираем все изображения в текущем блоке
        for (const [index, imageUri] of images[blockName].entries()) {
          // Сжимаем изображение
          const compressedImageUri = await compressImage(imageUri);
          if (compressedImageUri) {
            // Добавляем сжатое изображение в FormData
            formData.append(`${blockName}[${index}]`, {
              uri: compressedImageUri,
              name: `${blockName}_${index}.jpg`,
              type: 'image/jpg',
            });
          }
        }
      }
  
      // Отправляем FormData на сервер
      const response = await axios.post('http://192.168.0.9:3000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Обработка успешного ответа от сервера
      Alert.alert('Success', 'All images uploaded successfully');
    } catch (error) {
      // Обработка ошибок загрузки
      Alert.alert('Error', 'Failed to upload images');
    }
  };
// Функция для сжатия изображения
const compressImage = async (uri) => {
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.5, format: 'jpeg' } // параметры сжатия и формата
    );
    console.log('Image compressed successfully');
    return manipulatedImage.uri; // возвращает uri сжатого изображения
  } catch (error) {
    console.error('Failed to compress image', error);
    return null;
  }
};

  return (
    <ScrollView style={styles.main}>
      <Text style={styles.BoldText}>Отчет</Text>
      <TouchableOpacity onPress={() => pickImage('terminal')}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Терминал (внешний вид)</Text>
          {images.terminal.map((uri, index) => (
            <Image key={index} source={{ uri }} style={{ width: 50, height: 50 }} />
          ))}
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => pickImage('serailnumber')}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Терминал (серийный номер)</Text>
          {images.serailnumber.map((uri, index) => (
            <Image key={index} source={{ uri }} style={{ width: 50, height: 50 }} />
          ))}
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => pickImage('payment')}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Оплата</Text>
          {images.payment.map((uri, index) => (
            <Image key={index} source={{ uri }} style={{ width: 50, height: 50 }} />
          ))}
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => pickImage('paymentkey')}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Оплата 5001</Text>
          {images.paymentkey.map((uri, index) => (
            <Image key={index} source={{ uri }} style={{ width: 50, height: 50 }} />
          ))}
        </View>
      </TouchableOpacity>
      

      <TouchableOpacity onPress={() => pickImage('cancel')}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Отмена</Text>
          {images.cancel.map((uri, index) => (
            <Image key={index} source={{ uri }} style={{ width: 50, height: 50 }} />
          ))}
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => pickImage('finalCheck')}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Финальная сверка итогов</Text>
          {images.finalCheck.map((uri, index) => (
            <Image key={index} source={{ uri }} style={{ width: 50, height: 50 }} />
          ))}
        </View>
      </TouchableOpacity>
      
      <Button title="Завершить" onPress={() => uploadAllImages(images)} />
    </ScrollView>
  );
}




export default function FullScreenInfo() {
  const [currentScreen, setCurrentScreen] = useState('attributes');
  


  
  return (
    <View style={styles.container}>
      <View style={styles.mainButton}>
        <View style={styles.navBox}> 
            <View style = {styles.box}>
                <TouchableOpacity onPress={() => setCurrentScreen('attributes')}>
                    <Text style={[styles.textButton, currentScreen === 'attributes' ? styles.activeBox : null]}>Атрибуты</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCurrentScreen('jobs')}>
                    <Text style={[styles.textButton, currentScreen === 'jobs' ? styles.activeBox: null]}>Работы</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
      {currentScreen === 'attributes' && <AttributesComponent/>}
      {currentScreen === 'jobs' && <JobsComponent/>}
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
  textContainer:{
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
  activeBox:{//активация кнопок(подсветка)
    backgroundColor: '#4287f5',
    color: 'white'
  },
  mainButton:{
      backgroundColor: '#ffff',  
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
  BoldText:{
    fontWeight: 'bold',
    margin: 5
  }
  });
