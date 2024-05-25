import React, { useState, useContext } from 'react';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity, Image, Button, Alert, TextInput } from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';
import { ApiUrlContext } from './contexts/ApiUrlContext';
import Icon from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';


function AttributesComponent() {
  const route = useRoute();
  const { itemData } = route.params;
  return (
    <ScrollView style={styles.main}>
      <Text style={styles.textContainer}>{JSON.stringify(itemData.Description).replace(/\\n/g, '\n')}</Text>
    </ScrollView>
  );
}

const BLOCK_CONFIGS = {
  installation: {
    title: 'Монтаж',
    description: 'Описание процесса монтажа.',
    sections: [
      { name: 'layout', label: 'Место монтажа',icon: 'download' },
      { name: 'terminal', label: 'Терминал (внешний вид)',icon: 'download' },
      { name: 'serialnumber', label: 'Терминал (серийный номер)',icon: 'download' },
      { name: 'payment', label: 'Оплата',icon: 'download' },
      { name: 'paymentkey', label: 'Оплата 5001',icon: 'download' },
      { name: 'cancel', label: 'Отмена',icon: 'download' },
      { name: 'finalCheck', label: 'Финальная сверка итогов',icon: 'download' },
    ],
  },
  dismantling: {
    title: 'Демонтаж',
    description: 'Описание процесса демонтажа.',
    sections: [
      // Добавьте соответствующие секции для демонтажа
      { name: 'terminal', label: 'Терминал (внешний вид)',icon: 'download' },
      { name: 'serialnumber', label: 'Терминал (серийный номер)',icon: 'download' },
    ],
  },
  restoration: {
    title: 'Сервис',
    description: 'Описание процесса сервиса.',
    sections: [
      // Добавьте соответствующие секции для восстановления
      { name: 'serialnumber', label: 'Терминал (серийный номер)' },
      { name: 'payment', label: 'Оплата' },
      { name: 'paymentkey', label: 'Оплата 5001' },
      { name: 'cancel', label: 'Отмена' },
      { name: 'finalCheck', label: 'Финальная сверка итогов' },
    ],
  },
};

function JobsComponent() {
  
  const { apiUrl } = useContext(ApiUrlContext);
  const [images, setImages] = useState({
    terminal: [],
    serialnumber: [],
    payment: [],
    paymentkey: [],
    cancel: [],
    finalCheck: []
  });
  const [serialNumbers, setSerialNumbers] = useState({
    terminal: '',
    serialnumber: '',
    payment: '',
    paymentkey: '',
    cancel: '',
    finalCheck: ''
  });

  const [openBlock, setOpenBlock] = useState(null);

  const pickImage = async (blockName) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImages(prevImages => ({
        ...prevImages,
        [blockName]: [...prevImages[blockName], result.assets[0].uri]
      }));
    }
  };

  const uploadAllImages = async () => {
    const currentBlockConfig = BLOCK_CONFIGS[openBlock];
    const missingSections = currentBlockConfig.sections.filter(section => images[section.name].length === 0);

    if (missingSections.length > 0) {
      const missingSectionLabels = missingSections.map(section => section.label).join(', ');
      Alert.alert('Ошибка', `Необходимо загрузить фотографии для следующих секций: ${missingSectionLabels}`);
      return;
    }

    try {
      const formData = new FormData();
      for (const blockName in images) {
        for (const [index, imageUri] of images[blockName].entries()) {
          const compressedImageUri = await compressImage(imageUri);
          if (compressedImageUri) {
            formData.append(`${blockName}[${index}]`, {
              uri: compressedImageUri,
              name: `${blockName}_${index}.jpg`,
              type: 'image/jpg',
            });
          }
        }
      }
      const response = await axios.post(`${apiUrl}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Alert.alert('Success', 'All images uploaded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload images');
    }
  };

  const compressImage = async (uri) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.5, format: 'jpeg' }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Failed to compress image', error);
      return null;
    }
  };

  const toggleBlock = (blockName) => {
    setOpenBlock(openBlock === blockName ? null : blockName);
  };

  return (
    <ScrollView style={styles.main}>
      {Object.entries(BLOCK_CONFIGS).map(([blockName, config]) => (
        <Block
          key={blockName}
          title={config.title}
          description={config.description}
          blockName={blockName}
          serialNumbers={serialNumbers} // Передаем serialNumbers в Block
          setSerialNumbers={setSerialNumbers}
          sections={config.sections}
          pickImage={pickImage}
          images={images}
          openBlock={openBlock}
          toggleBlock={toggleBlock}
        />
        
      ))}
      <Button title="Завершить" onPress={uploadAllImages} />
    </ScrollView>
  );
}

const Block = ({ title, description, blockName, sections, pickImage, images, serialNumbers, setSerialNumbers, openBlock, toggleBlock }) => {
  const navigation = useNavigation();  // Используйте useNavigation для получения объекта navigation

  return (
    <View style={styles.textContainer}>
      <TouchableOpacity onPress={() => toggleBlock(blockName)}>
        <Text style={styles.BoldText}>{title}</Text>
      </TouchableOpacity>
      {openBlock === blockName && (
        <View>
          <Text style={styles.description}>{description}</Text>
          {sections.map((section) => (
            <View key={section.name} style={styles.textContainer}>
              <Text style={styles.text}>
                {section.label}
              </Text>
              {section.name === 'serialnumber' ? (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Введите серийный номер"
                    value={serialNumbers[section.name]}
                    onChangeText={(text) => setSerialNumbers({ ...serialNumbers, [section.name]: text })}
                  />
                  <TouchableOpacity onPress={() => navigation.navigate(' ')} style={styles.scanIcon}>
                    <Icon name="scan1" size={20} style={{ marginLeft: 10 }} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => pickImage(section.name)} style={styles.imageContainer}>
                  {images[section.name]?.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={{ width: 50, height: 50 }} />
                  ))}
                  <Icon name={section.icon} size={20} color="#000" style={{}} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default function FullScreenInfo() {
  const [currentScreen, setCurrentScreen] = useState('attributes');

  return (
    <View style={styles.container}>
      <View style={styles.mainButton}>
        <View style={styles.navBox}>
          <View style={styles.box}>
            <TouchableOpacity onPress={() => setCurrentScreen('attributes')}>
              <Text style={[styles.textButton, currentScreen === 'attributes' ? styles.activeBox : null]}>Атрибуты</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentScreen('jobs')}>
              <Text style={[styles.textButton, currentScreen === 'jobs' ? styles.activeBox : null]}>Работы</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {currentScreen === 'attributes' && <AttributesComponent />}
      {currentScreen === 'jobs' && <JobsComponent />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    backgroundColor: '#e3e3e3',
    flex: 1
  },
  textContainer: {
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
  activeBox: {
    backgroundColor: '#4287f5',
    color: 'white'
  },
  mainButton: {
    backgroundColor: '#ffff',
  },
  textButton: {
    color: 'black',
    padding: 5,
    textAlign: 'center',
    borderRadius: 25,
    margin: 5
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
  BoldText: {
    fontWeight: 'bold',
    margin: 5
  },
  description: {
    padding: 10,
    fontStyle: 'italic',
    color: '#666',
    marginLeft: 5
  },
  text: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 10,
  },
  scanIcon: {
    marginLeft: 10,
  },
});