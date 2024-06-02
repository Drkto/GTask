import React, { useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  ToastAndroid,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { ApiUrlContext } from "./contexts/ApiUrlContext";
import Icon from "react-native-vector-icons/AntDesign";
import { UserContext } from "./contexts/UserContext";

export default function Equip() {
  const [engineers, setEngineers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { apiUrl } = useContext(ApiUrlContext);
  const { user } = useContext(UserContext); // Использование UserContext для получения текущего пользователя
  const [data, setData] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEquipmentSNs, setNewEquipmentSNs] = useState([]);
  const [showEngineerList, setShowEngineerList] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`${apiUrl}/equipment-data`);
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

  const handleSave = async () => {
    if (!searchQuery.trim() || newEquipmentSNs.length === 0) {
      showToast("Все поля должны быть заполнены");
      return;
    }

    try {
      const selectedEngineer = engineers.find(
        (engineer) => engineer.FIO === searchQuery
      );
      const engineerId = selectedEngineer ? selectedEngineer.idEngineer : null;

      const requestBody = JSON.stringify({
        engineerId: engineerId,
        equipmentSN: newEquipmentSNs,
      });

      console.log("Sending request with body:", requestBody);

      const response = await fetch(`${apiUrl}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error("Ошибка при отправке данных");
      }

      showToast("Данные отправлены инженеру");
      setModalVisible(false);
      setSearchQuery("");
      setNewEquipmentSNs([]);
      await fetchData();
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
      showToast("Произошла ошибка при отправке данных");
    }
  };

  const handleCopy = (name, sn) => {
    const copiedInfo = `Оборудование: ${name}\nСерийный номер: ${sn}`;
    Clipboard.setString(copiedInfo);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetch(`${apiUrl}/engineers`)
      .then((response) => response.json())
      .then((jsonData) => setEngineers(jsonData))
      .catch((error) => console.error("Error fetching engineers: ", error));
  }, []);

  const filterEngineers = () => {
    return engineers.filter(
      (engineer) =>
        engineer.idEngineer !== user.id && // Исключение текущего пользователя
        engineer.FIO.toLowerCase().includes(searchQuery.toLowerCase()) // Поиск по всей строке, без учета регистра
    );
  };

  const handleSelectEngineer = (engineer) => {
    setSearchQuery(engineer.FIO);
    setShowEngineerList(false);
  };

  const handleAddEquipment = () => {
    setModalVisible(true);
  };

  const handleScan = () => {
    alert("Сканирование!");
  };

  const showToast = (message) => {
    ToastAndroid.showWithGravity(message, ToastAndroid.SHORT, ToastAndroid.TOP);
  };

  const handleAddSNField = () => {
    setNewEquipmentSNs([...newEquipmentSNs, ""]);
  };

  const handleSNChange = (text, index) => {
    const updatedSNs = [...newEquipmentSNs];
    updatedSNs[index] = text;
    setNewEquipmentSNs(updatedSNs);
  };

  const handleRemoveSNField = (index) => {
    const updatedSNs = [...newEquipmentSNs];
    updatedSNs.splice(index, 1);
    setNewEquipmentSNs(updatedSNs);
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
                onPress={() => handleCopy(item.Name, item.SN)}
              >
                <Icon name="copy1" size={24} color="black" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.idEquipment.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddEquipment}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
        <Modal
          animationType="none"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Передача оборудования</Text>
              <TextInput
                style={styles.input}
                placeholder="Поиск инженера"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setShowEngineerList(true); // Показывать список инженеров при изменении запроса
                }}
              />
              {searchQuery && showEngineerList && (
                <FlatList
                  data={filterEngineers()}
                  ListHeaderComponent={() => (
                    <Text style={styles.listHeader}>Выберите инженера</Text>
                  )}
                  ListEmptyComponent={() => (
                    <Text style={styles.emptyListText}>Нет в списке</Text>
                  )}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleSelectEngineer(item)}
                    >
                      <Text>{`${item.FIO}`}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.idEngineer.toString()}
                />
              )}
              <View>
                {newEquipmentSNs.map((sn, index) => (
                  <View key={index} style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputWithIcon}
                      placeholder={`Серийный номер ${index + 1}`}
                      value={sn}
                      onChangeText={(text) => handleSNChange(text, index)}
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleScan(index)}
                    >
                      <Icon name="scan1" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveSNField(index)}
                    >
                      <Icon name="close" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
                ))}
                {!showEngineerList && (
                  <TouchableOpacity
                    style={styles.addButton_2}
                    onPress={handleAddSNField}
                  >
                    <Text style={styles.addButtonText_2}>
                      Добавить SN оборудования
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.modalButtons}>
                <Button title="Отмена" onPress={() => setModalVisible(false)} />
                <Button title="Сохранить" onPress={handleSave} />
              </View>
            </View>
          </View>
        </Modal>
        <TouchableOpacity style={styles.addButton} onPress={handleAddEquipment}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </SafeAreaView>
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
  error: {
    color: "red",
    textAlign: "center",
    margin: 10,
  },
  addButton_2: {
    backgroundColor: "#4287f5",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: "center",
  },
  addButtonText_2: {
    color: "#fff",
    fontSize: 16,
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4287f5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 40,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 5,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  inputWithIcon: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  scanButton: {
    marginLeft: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  copyIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptyListText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
  },
  removeButton: {
    padding: 5,
    marginLeft: 5,
  },
});
