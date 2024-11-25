import React, { useState, useEffect, useContext, useLayoutEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from "react-native";
import moment from "moment";
import "moment/locale/ru";
import { ApiUrlContext } from "./contexts/ApiUrlContext";
import { UserContext } from "./contexts/UserContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntDesign from "react-native-vector-icons/AntDesign";

// Компонент для активных заявок
function ActiveWork({
  data,
  navigation,
  onRefresh,
  refreshing,
  lastUpdated,
  networkError,
}) {
  const LoadScene = (item) => {
    navigation.navigate("О Заявке", { itemData: item });
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Никогда";

    const now = new Date();
    const diff = now - lastUpdated;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `Обновлено ${hours} ч. назад`;
    } else if (minutes > 0) {
      return `Обновлено ${minutes} мин. назад`;
    } else {
      return `Обновлено ${seconds} сек. назад`;
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return moment(dateTime).format("lll");
  };

  const filterAndSortDataByActive = () => {
    return data
      .filter((item) => item.Status === 0)
      .sort((a, b) => new Date(b.Date) - new Date(a.Date));
  };

  return (
    <SafeAreaView style={styles.main}>
      {networkError && (
        <Text style={styles.errorText}>Отсутствует подключение к серверу.</Text>
      )}
      <FlatList
        ListHeaderComponent={() => (
          <Text style={styles.lastUpdatedText}>{formatLastUpdated()}</Text>
        )}
        data={filterAndSortDataByActive()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.text} onPress={() => LoadScene(item)}>
            <Text style={{ flexDirection: "row", marginRight: 10 }}>
              <Text>№ Заявки: {item.Number || "N/A"} </Text>
              <Text style={styles.activeBox}>{item.Service || "N/A"}</Text>
            </Text>
            <Text>
              Дата создания: {item.Date ? formatDateTime(item.Date) : "N/A"}
            </Text>
            <Text numberOfLines={2}>Адрес: {item.Address || "N/A"}</Text>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

// Компонент для архивных заявок
function ArchiveWork({
  navigation,
  onRefresh,
  refreshing,
  lastUpdated,
  networkError,
  apiUrl,
  user,
  searchText,
}) {
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allData, setAllData] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const LoadScene = (item) => {
    navigation.navigate("О Заявке", { itemData: item });
  };

    // Фильтрация данных на основе текста поиска
    const filterDataBySearch = () => {
      if (!searchText) return allData;
  
      const lowerSearchText = searchText.toLowerCase();
      return allData.filter((item) => {
        return (
          (item.Number && item.Number.toString().includes(lowerSearchText)) ||
          (item.Service &&
            item.Service.toLowerCase().includes(lowerSearchText)) ||
          (item.Address &&
            item.Address.toLowerCase().includes(lowerSearchText)) ||
          (item.Description &&
            item.Description.toLowerCase().includes(lowerSearchText))
        );
      });
    };
  
    const filteredData = filterDataBySearch();
  const formatLastUpdated = () => {
    if (!lastUpdated) return "Никогда";

    const now = new Date();
    const diff = now - lastUpdated;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `Обновлено ${hours} ч. назад`;
    } else if (minutes > 0) {
      return `Обновлено ${minutes} мин. назад`;
    } else {
      return `Обновлено ${seconds} сек. назад`;
    }
  };

  const formatDateTime = (dateTime) => {
    return moment(dateTime).format("lll");
  };

  const fetchArchiveData = async (isRefreshing = false) => {
    if ((loadingMore && !isRefreshing) || !hasMore) return;
    setLoadingMore(true);

    try {
      const response = await axios.get(`${apiUrl}/archive/${user.id}`, {
        params: {
          limit: 5,
          offset: isRefreshing ? 0 : page * 5,
        },
      });

      const newData = response.data;
      if (newData.length < 5) {
        setHasMore(false);
      }

      if (isRefreshing) {
        setAllData(newData);
        setPage(1);
      } else {
        setAllData((prevData) => [...prevData, ...newData]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных", error);
    }

    setLoadingMore(false);
  };

  useEffect(() => {
    fetchArchiveData(true);
  }, []);

  useEffect(() => {
    return () => {
      setAllData([]);
      setPage(0);
      setHasMore(true);
      setLoadingMore(false);
    };
  }, []);


  return (
    <SafeAreaView style={styles.main}>
      {networkError && (
        <Text style={styles.errorText}>Отсутствует подключение к серверу.</Text>
      )}
      <FlatList
        ListHeaderComponent={() => (
          <Text style={styles.lastUpdatedText}>{formatLastUpdated()}</Text>
        )}
        data={filteredData} // Используем отфильтрованные данные
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.text} onPress={() => LoadScene(item)}>
            <Text style={{ flexDirection: "row" }}>
              <Text>№ Заявки: {item.Number || "N/A"} </Text>
              <Text style={styles.activeBox}>{item.Service || "N/A"}</Text>
            </Text>
            <Text>
              Дата закрытия:{" "}
              {item.DateEnd ? formatDateTime(item.DateEnd) : "N/A"}
            </Text>
            <Text numberOfLines={2}>Адрес: {item.Address || "N/A"}</Text>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          if (hasMore && !loadingMore) {
            fetchArchiveData(false);
          }
        }}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() =>
          loadingMore && <ActivityIndicator size="large" />
        }
      />
    </SafeAreaView>
  );
}

export default function Main({ navigation }) {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { apiUrl } = useContext(ApiUrlContext);
  const { user } = useContext(UserContext);
  const [data, setData] = useState([]);
  const [currentScreen, setCurrentScreen] = useState("ActiveWork");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timer, setTimer] = useState(null);
  const [networkError, setNetworkError] = useState(false);
  const [totalRequests, setTotalRequests] = useState(0);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      onRefresh(); // Вызываем функцию refresh при каждом фокусировании на экране
    });
    return unsubscribe;
  }, [navigation]); // navigation добавляем в зависимости, чтобы useEffect сработал при каждом изменении этой переменной

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          {searchVisible ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  borderWidth: 0,
                  borderBottomWidth: 1,
                  borderColor: "#A5A5A5",
                  padding: 5,
                  marginRight: 5,
                }}
                placeholder="Поиск..."
                onChangeText={(text) => setSearchText(text)}
                value={searchText} // Устанавливаем значение текста поиска
              />
              <TouchableOpacity
                onPress={() => {
                  setSearchVisible(false);
                  setSearchText(""); // Очищаем строку поиска при нажатии на крестик
                }}
                style={{ marginRight: 15, justifyContent: "center" }}
              >
                <AntDesign name="closecircle" size={20} color="black" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setSearchVisible(true)}
              style={{ marginRight: 15 }}
            >
              <AntDesign name="search1" size={24} color="black" />
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [navigation, searchVisible, searchText]);

  useEffect(() => {
    const initializeData = async () => {
      const localData = await loadDataFromLocalStorage();
      setData(localData);
      setTotalRequests(localData.length); // Устанавливаем количество заявок из локального хранилища
      navigation.setParams({ totalRequests: localData.length }); // Передаём в навигацию

      // Загрузка данных с сервера (если пользователь авторизован)
      if (user && user.id) {
        fetchData(user.id);
      }
    };

    initializeData();
  }, [apiUrl, user]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(new Date());
    }, 7000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchData = async (idEngineer) => {
    setRefreshing(true);
    try {
      const response = await axios.get(`${apiUrl}/active/${idEngineer}`);
      const fetchedData = response.data;

      // Объединяем данные без дублирования
      const updatedData = mergeData(data, fetchedData);

      setData(updatedData);
      setLastUpdated(new Date());
      await saveDataToLocalStorage(updatedData);

      setTotalRequests(updatedData.length);
      navigation.setParams({ totalRequests: updatedData.length });
      setNetworkError(false);
    } catch (error) {
      console.error("Ошибка при загрузке данных", error);

      // В случае ошибки используем только локальные данные
      setNetworkError(true);
      setTimeout(() => setNetworkError(false), 5000);
    }
    setRefreshing(false);
  };

  const filterDataBySearch = (searchText) => {
    const lowerSearchText = searchText.toLowerCase();
    return data.filter((item) => {
      // Проверяем наличие полей перед использованием
      return (
        (item.Number && item.Number.toString().includes(lowerSearchText)) ||
        (item.Service &&
          item.Service.toLowerCase().includes(lowerSearchText)) ||
        (item.Address &&
          item.Address.toLowerCase().includes(lowerSearchText)) ||
        (item.Description &&
          item.Description.toLowerCase().includes(lowerSearchText))
      );
    });
  };

  const onRefresh = async () => {
    if (user && user.id) {
      setRefreshing(true);
      await fetchData(user.id);
      setRefreshing(false);
    }
  };

  const saveDataToLocalStorage = async (data) => {
    try {
      await AsyncStorage.setItem("requests", JSON.stringify(data));
    } catch (error) {
      console.error(
        "Ошибка при сохранении данных в локальное хранилище",
        error
      );
    }
  };
    // Слияние данных без дублирования (по уникальному ID, например `id`)
    const mergeData = (localData, fetchedData) => {
      const existingIds = new Set(localData.map((item) => item.idRequest));
      const newData = fetchedData.filter((item) => !existingIds.has(item.idRequest));
      return [...localData, ...newData];
    };

  const loadDataFromLocalStorage = async () => {
    try {
      const data = await AsyncStorage.getItem("requests");
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(
        "Ошибка при загрузке данных из локального хранилища",
        error
      );
      return [];
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainButton}>
        <View style={styles.navBox}>
          <View style={styles.box}>
            <TouchableOpacity onPress={() => setCurrentScreen("ActiveWork")}>
              <Text
                style={[
                  styles.textButton,
                  currentScreen === "ActiveWork" ? styles.activeBox : null,
                ]}
              >
                Активные
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentScreen("ArchiveWork")}>
              <Text
                style={[
                  styles.textButton,
                  currentScreen === "ArchiveWork" ? styles.activeBox : null,
                ]}
              >
                Архивные
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {currentScreen === "ActiveWork" && (
        <ActiveWork
          data={filterDataBySearch(searchText)}
          navigation={navigation}
          onRefresh={onRefresh}
          refreshing={refreshing}
          lastUpdated={lastUpdated}
          networkError={networkError}
        />
      )}
      {currentScreen === "ArchiveWork" && (
        <ArchiveWork
          data={filterDataBySearch(searchText)}
          navigation={navigation}
          onRefresh={onRefresh}
          refreshing={refreshing}
          lastUpdated={lastUpdated}
          networkError={networkError}
          apiUrl={apiUrl}
          user={user}
          searchText={searchText}
        />
      )}
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
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
  mapIcon: {
    position: "absolute",
    bottom: "1%", // Расстояние от нижней границы
    right: 15, // Расстояние от правой границы
    width: 60, // Ширина круглого контейнера
    height: 60, // Высота круглого контейнера
    borderRadius: 30, // Радиус круглого контейнера (равный половине ширины или высоты)
    backgroundColor: "#4287f5", // Цвет круглого контейнера
    justifyContent: "center", // Выравнивание текста по центру по вертикали
    alignItems: "center", // Выравнивание текста по центру по горизонтали
  },
  activeBox: {
    // активация кнопок (подсветка)
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
  errorText: {
    textAlign: "center", // Центрирует текст по горизонтали
    justifyContent: "center", // Центрирует текст по вертикали
    alignSelf: "center", // Центрирует элемент по горизонтали
    color: "red", // Цвет текста
    padding: 10, // Внутренний отступ
    fontSize: 16, // Размер шрифта
  },
});
