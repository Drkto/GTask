import React, {useState} from 'react';
import { StyleSheet,Text,ScrollView,View,TouchableOpacity} from 'react-native';
import { useRoute } from '@react-navigation/native';

function AttributesComponent() {
  const route = useRoute();
  const { itemData } = route.params;
  return (
    <ScrollView style={styles.main} >
        <Text style={styles.text}>{JSON.stringify(itemData.Description).replace(/\\n/g, '\n')}</Text>
    </ScrollView>
  );
}

function JobsComponent() {
  return (
      <ScrollView style={styles.main} >
          <Text style={styles.BoldText} >Выбор банка</Text>
          <TouchableOpacity><Text style={styles.text}>ГазпромБанк</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.text}>Альфа-Банк</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.text}>ВТБ</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.text}>Тинькофф, МТС-БАНК</Text></TouchableOpacity>
      </ScrollView>

  );
}




export default function FullScrenInfo() {
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
      {currentScreen === 'attributes' && <AttributesComponent />}
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
