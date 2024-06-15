import React, { useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Button,
  ScrollView,
  Alert,
} from "react-native";
import { ApiUrlContext } from "./contexts/ApiUrlContext";
import { useNavigation } from "@react-navigation/native";
import { UserContext } from "./contexts/UserContext";
import AntDesign from "react-native-vector-icons/AntDesign";
import * as Clipboard from "expo-clipboard";

function Stock({ data, isConnected, refreshing, onRefresh }) {
  const handleCopyToClipboard = (equipment) => {
    const { Name, SN } = equipment;
    const textToCopy = `Оборудование: ${Name}, Серийный номер: ${SN}`;
    Clipboard.setString(textToCopy);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.main}>
        {!isConnected && (
          <Text style={styles.error}>Нет соединения с сервером</Text>
        )}
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <View style={styles.text}>
              <Text>Оборудование: {item.Name}</Text>
              <Text>Серийный номер: {item.SN}</Text>
              <TouchableOpacity
                style={styles.copyIcon}
                onPress={() => handleCopyToClipboard(item.Name, item.SN)}
              >
                <AntDesign name="copy1" size={24} color="black" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.idEquipment.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </SafeAreaView>
    </View>
  );
}

function Broadcast({ apiUrl, data, user }) {
  const [engineerName, setEngineerName] = useState("");
  const [engineerFound, setEngineerFound] = useState(false);
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState([]);

  const handleEquipmentTransfer = async () => {
    try {
      const response = await fetch(`${apiUrl}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          engineerId: selectedEngineer.idEngineer,
          equipmentSN: selectedEquipment.map((item) => item.SN),
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      console.log("Transfer successful:", result);
      Alert.alert("Успех", "Оборудование успешно передано инженеру.");
      handleEngineerDeselect(); // Reset selection after transfer
    } catch (error) {
      console.error("Error transferring equipment:", error);
      Alert.alert("Ошибка", "Произошла ошибка при передаче оборудования.");
    }
  };

  const handleSearchEngineer = async () => {
    try {
      console.log(
        `Отправка запроса на: ${apiUrl}/engineers?name=${engineerName}`
      );
      const response = await fetch(`${apiUrl}/engineers?name=${engineerName}`);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const jsonData = await response.json();
      console.log("Полученные данные:", jsonData);

      const filteredEngineers = jsonData.filter(
        (engineer) => engineer.idEngineer !== user.id
      );
      setEngineers(filteredEngineers);
      setEngineerFound(filteredEngineers.length > 0);

      console.log("Результаты фильтрации:", filteredEngineers);
    } catch (error) {
      console.error("Ошибка при запросе инженеров:", error);
      setEngineerFound(false);
    }
  };

  const handleEquipmentSelection = (equipment) => {
    setSelectedEquipment((prevSelected) =>
      prevSelected.includes(equipment)
        ? prevSelected.filter((item) => item !== equipment)
        : [...prevSelected, equipment]
    );
  };

  const handleEngineerSelection = (engineer) => {
    setSelectedEngineer(engineer);
  };

  const handleEngineerDeselect = () => {
    setSelectedEngineer(null);
    setEngineerName("");
    setEngineers([]);
    setEngineerFound(false);
  };

  return (
    <View style={styles.container}>
      {selectedEngineer ? (
        <>
          <View style={[styles.text, styles.searchContainer]}>
            <Text>Кому: {selectedEngineer.FIO}</Text>
            <AntDesign
              name="closecircle"
              size={25}
              color="red"
              marginLeft={10}
            />
          </View>
          <ScrollView>
            {data.map((item) => (
              <TouchableOpacity
                key={item.idEquipment}
                style={[
                  styles.text,
                  styles.equipmentItem,
                  selectedEquipment.includes(item) && styles.selectedItem,
                ]}
                onPress={() => handleEquipmentSelection(item)}
              >
                <View>
                  <Text>Оборудование: {item.Name}</Text>
                  <Text>Серийный номер: {item.SN}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <Button
              title="Передать оборудование"
              onPress={handleEquipmentTransfer}
            />
          </ScrollView>
        </>
      ) : (
        <>
          <View style={[styles.text, styles.searchContainer]}>
            <TextInput
              style={styles.input}
              placeholder="Введите ФИО инженера"
              value={engineerName}
              onChangeText={setEngineerName}
            />
            <TouchableOpacity onPress={handleSearchEngineer}>
              <AntDesign name="search1" size={30} marginLeft={20} />
            </TouchableOpacity>
          </View>
          {engineerFound && (
            <View style={styles.text}>
              <Text>Выберите инженера для передачи:</Text>
              {engineers.map((item) => (
                <TouchableOpacity
                  key={item.idEngineer}
                  style={[
                    styles.engineerItem,
                    selectedEngineer?.idEngineer === item.idEngineer &&
                      styles.selectedEngineer,
                  ]}
                  onPress={() => handleEngineerSelection(item)}
                >
                  <Text>{item.FIO}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

export default function Equip() {
  const [currentScreen, setCurrentScreen] = useState("Stock");
  const { apiUrl } = useContext(ApiUrlContext);
  const { user } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const navigation = useNavigation();

  const fetchData = async () => {
    try {
      const response = await fetch(`${apiUrl}/equipment-data/${user.id}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const jsonData = await response.json();
      setData(jsonData);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleEquipmentSelection = (equipment) => {
    setSelectedEquipment(equipment);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      onRefresh();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.mainButton}>
        <View style={styles.navBox}>
          <View style={styles.box}>
            <TouchableOpacity onPress={() => setCurrentScreen("Stock")}>
              <Text
                style={[
                  styles.textButton,
                  currentScreen === "Stock" ? styles.activeBox : null,
                ]}
              >
                Мой склад
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentScreen("Broadcast")}>
              <Text
                style={[
                  styles.textButton,
                  currentScreen === "Broadcast" ? styles.activeBox : null,
                ]}
              >
                Передача
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {currentScreen === "Stock" && (
        <Stock
          data={data}
          isConnected={isConnected}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onSelect={handleEquipmentSelection}
        />
      )}
      {currentScreen === "Broadcast" && (
        <Broadcast apiUrl={apiUrl} data={data} user={user} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    backgroundColor: "#e3e3e3",
    flex: 1,
  },
  text: {
    padding: 20,
    borderRadius: 5,
    backgroundColor: "#FFFF",
    margin: 5,
    width: "98%",
    marginLeft: "1%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  equipmentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFFF",
    margin: 5,
  },
  selectedItem: {
    backgroundColor: "#cce5ff",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    flex: 1,
  },
  error: {
    color: "red",
  },
  activeBox: {
    backgroundColor: "#4287f5",
    color: "white",
  },
  textButton: {
    color: "black",
    padding: 5,
    textAlign: "center",
    borderRadius: 25,
    margin: 5,
  },
  navBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "left",
  },
  box: {
    justifyContent: "center",
    flexDirection: "row",
  },
  mainButton: {
    backgroundColor: "#ffff",
  },
  lastUpdatedText: {
    textAlign: "right",
    marginVertical: 5,
    marginRight: 10,
    color: "gray",
  },
  engineerItem: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  selectedEngineer: {
    backgroundColor: "#cce5ff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  copyIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
});
