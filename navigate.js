import React from 'react';
import Main from './components/main';
import FullScrenInfo from './components/FullScreenInfo';
import Maps from './components/maps'
import {View} from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';

import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';



const Stack = createStackNavigator();

export default function Navigate(){
    return <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen
                name = 'Заявки'
                component={Main}
                options = {{title: 'Заявки',
                headerRight: () => (
                    <View style={{ flexDirection: 'row', marginRight: 20 }}>
                        <AntDesign style={{marginRight:20}} name="filter" size={27} color="black" />
                        <AntDesign  name="search1" size={27} color="black" />
                    </View>
                  )
            }}
            />
            <Stack.Screen
                name = 'О Заявке' 
                component={FullScrenInfo}
                options = {({route}) =>({
                    title: 'Заявка № ' + route.params?.itemData.Number,
                })}
            />
            <Stack.Screen
                name = 'Карта' 
                component={Maps}
                options = {{
                    title: 'Карта'
                    }}

            />
        </Stack.Navigator>
    </NavigationContainer>;
}