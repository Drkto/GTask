import React from 'react';
import Main from './components/main';
import FullScreenInfo from './components/FullScreenInfo';
import LoginScreen from './components/loginscreen';
import Settings from './components/Settings';
import Equipments from './components/Equipments';
import { AntDesign } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { ApiUrlProvider } from './components/contexts/ApiUrlContext';

const Stack  = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Заявки"
       component={Main}
       options={{
        tabBarIcon: ({ color, size }) => (
          <AntDesign name="profile" size={size} color={color} />
        ),
      }} 
        />
      <Tab.Screen name="Оборудование"
       component={Equipments}
       options={{
        tabBarIcon: ({ color, size }) => (
          <AntDesign name="tool" size={size} color={color} />
        ),
      }} />
      <Tab.Screen name="Настройки"
       component={Settings}
       options={{
        tabBarIcon: ({ color, size }) => (
          <AntDesign name="setting" size={size} color={color} />
        ),
      }} />
    </Tab.Navigator>
  );
}





export default function navigate() {

  return (
    <ApiUrlProvider>
      <NavigationContainer>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="Main"
            component={TabNavigator}
            options={{ headerShown: false }} // скрыть заголовок
          />
          <Stack.Screen
            name="О Заявке"
            component={FullScreenInfo}
            options={({ route }) => ({
              title: 'Заявка № ' + route.params?.itemData.Number,
            })}
          />
        </Stack.Navigator>
        
        </NavigationContainer>
      </ApiUrlProvider>
  );
}