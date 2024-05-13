import React from 'react';
import { View, TouchableOpacity,Text } from 'react-native';

export default function Equipments() {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'lightgray', paddingVertical: 10 }}>
      <TouchableOpacity><Text>123</Text></TouchableOpacity>
    </View>
  );
}