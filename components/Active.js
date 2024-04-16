
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity} from 'react-native';
export default function Active() {


  return (
    <View style={styles.main}>
        <View style={styles.navBox}> 
            <View style = {styles.box}>
                <TouchableOpacity>
                    <Text style={[styles.text,styles.activeBox]}>Активные</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={[styles.text]}>Архивные</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
  );
}


const styles = StyleSheet.create({
    activeBox:{//активация кнопок(подсветка)
        backgroundColor: '#4287f5',
        color: 'white'
    },
    main:{
        backgroundColor: '#ffff',
        
    },
    text:{
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
});
