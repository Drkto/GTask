import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";
import axios from "axios";
import { ApiUrlContext } from "./contexts/ApiUrlContext";
import moment from "moment"; // формат времени для ленивых
import "moment/locale/ru"; // ru контент
import Constants from "expo-constants";
import { UserContext } from "./contexts/UserContext";

export default function NewsList() {
  const { user } = useContext(UserContext);
  const { apiUrl } = useContext(ApiUrlContext);
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [timezone, setTimezone] = useState(null); // Состояние для часовой зоны
  const [hasMoreData, setHasMoreData] = useState(true);

  useEffect(() => {
    if (hasMoreData) {
      loadNews(page, user.id);
    }
    fetchTimezone(); // Получение часовой зоны при загрузке компонента
  }, [page]);

  const fetchTimezone = () => {
    const deviceTimezone = Constants.timezone;
    setTimezone(deviceTimezone);
  };

  const formatDateTime = (dateTime) => {
    if (timezone) {
      return moment(dateTime).utcOffset(timezone).format("lll"); // Форматирование времени с учетом часовой зоны
    } else {
      return moment(dateTime).format("lll"); // Если часовая зона не установлена, вернуть время без учета зоны
    }
  };

  const loadNews = async (page, idEngineer) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}/data_news/${idEngineer}?page=${page}&limit=10`
      );
      const newNews = response.data;
      setNews((prevNews) => [...prevNews, ...newNews]);
      if (newNews.length < 10) {
        setHasMoreData(false);
      }
    } catch (error) {
      console.error("Ошибка при загрузке новостей", error);
    }
    setIsLoading(false);
  };

  const handleLoadMore = () => {
    if (!isLoading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePressNews = (newsId) => {
    setSelectedNewsId(newsId === selectedNewsId ? null : newsId);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.newsItem}
      onPress={() => handlePressNews(item.idNews)}
    >
      <Text style={styles.newsTitle}>{item.Title}</Text>
      <Text style={styles.dateText}>
        Дата публикации: {formatDateTime(item.Publication_date)}
      </Text>
      <Text style={styles.authorText}>{item.category_name}</Text>
      {selectedNewsId === item.idNews && (
        <View style={styles.selectedNewsContainer}>
          <View style={styles.separator} />
          <Text style={styles.selectedNewsText}>{item.Text}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={news}
        renderItem={renderItem}
        keyExtractor={(item) => item.idNews.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isLoading && <Text style={styles.loadingText}>Загрузка...</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  newsItem: {
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
  newsTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 12,
    color: "gray",
  },
  loadingText: {
    textAlign: "center",
    paddingVertical: 10,
  },
  selectedNewsContainer: {
    paddingVertical: 10,
  },
  authorText: {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginBottom: 10,
  },
  selectedNewsText: {
    fontSize: 16,
  },
});
