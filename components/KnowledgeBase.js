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
import moment from "moment";
import "moment/locale/ru";
import { UserContext } from "./contexts/UserContext";

export default function KnowledgeBase() {
  const { user } = useContext(UserContext);
  const { apiUrl } = useContext(ApiUrlContext);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [hasMoreData, setHasMoreData] = useState(true);

  useEffect(() => {
    if (hasMoreData) {
      loadKnowledgeBase(page, user.id);
    }
  }, [page]);

  const loadKnowledgeBase = async (page, idEngineer) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}/knowledge_base/${idEngineer}?page=${page}&limit=10`
      );
      const newItems = response.data;
      setKnowledgeBase((prevItems) => [...prevItems, ...newItems]);
      if (newItems.length < 10) {
        setHasMoreData(false);
      }
    } catch (error) {
      console.error("Ошибка при загрузке базы знаний", error);
    }
    setIsLoading(false);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMoreData) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePressItem = (itemId) => {
    setSelectedItemId(selectedItemId === itemId ? null : itemId);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => handlePressItem(item.idKnowledgebase)}
    >
      <Text style={styles.title}>{item.theme}</Text>
      <Text style={styles.date}>{moment(item.date).format("lll")}</Text>
      {selectedItemId === item.idKnowledgebase && (
        <View style={styles.selectedItemContainer}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.category}>Категория: {item.category}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={knowledgeBase}
        renderItem={renderItem}
        keyExtractor={(item) => item.idKnowledgebase.toString()}
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
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
  },
  selectedItemContainer: {
    paddingTop: 10,
  },
  description: {
    fontSize: 16,
  },
  category: {
    fontSize: 14,
    color: "#666",
  },
  loadingText: {
    textAlign: "center",
    paddingVertical: 10,
  },
});
