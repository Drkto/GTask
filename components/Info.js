import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";

export default function Info() {
  const navigation = useNavigation();

  const handlePressNews = () => {
    // Перейти на страницу списка новостей
    navigation.navigate("Просмотр новости");
  };
  const handlePressKnowledge = () => {
    // Перейти на страницу списка новостей
    navigation.navigate("База знаний");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePressNews}>
        <View style={styles.iconTextContainer}>
          <AntDesign name="infocirlce" size={30} />
          <Text style={styles.text}>Новости</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handlePressKnowledge}>
        <View style={styles.iconTextContainer}>
          <AntDesign name="book" size={30} />
          <Text style={styles.text}>База знаний</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e3e3e3",
    flex: 1,
  },
  button: {
    padding: 20,
    borderRadius: 5,
    backgroundColor: "#FFFF",
    margin: 5,
    width: "98%",
    marginLeft: "1%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    marginLeft: 10,
    fontSize: 18,
  },
  subText: {
    marginLeft: 40,
    fontSize: 14,
    color: "gray",
  },
});
