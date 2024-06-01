import React, { useState, useEffect, useRef, useContext } from "react";
import { StyleSheet, View, Button } from "react-native";
import { Svg, Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { UserContext } from "./contexts/UserContext";
import { ApiUrlContext } from './contexts/ApiUrlContext';


export default function App() {
  const { apiUrl } = useContext(ApiUrlContext);
  const { user } = useContext(UserContext);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const svgRef = useRef(null);

  useEffect(() => {
    loadDrawings();
  }, []);

  const loadDrawings = async () => {
    try {
      const savedDrawings = await AsyncStorage.getItem("drawings");
      if (savedDrawings !== null) {
        setPaths(JSON.parse(savedDrawings));
      }
    } catch (error) {
      console.error("Failed to load drawings", error);
    }
  };

  const saveDrawings = async () => {
    try {
      await AsyncStorage.setItem("drawings", JSON.stringify(paths));
      if (user && user.id) {
        await uploadDrawingsToServer();
      }
    } catch (error) {
      console.error("Failed to save drawings", error);
    }
  };

  const uploadDrawingsToServer = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/upload-drawing`,
        {
          engineerId: user.id,
          drawing: paths,
        }
      );

      console.log("Drawings uploaded successfully:", response.data);
    } catch (error) {
      console.error("Failed to upload drawings", error);
    }
  };

  const handleTouchMove = (event) => {
    const { nativeEvent } = event;
    const { locationX, locationY } = nativeEvent;
    const updatedPath = `${currentPath} L${locationX},${locationY}`;
    setCurrentPath(updatedPath);
  };

  const handleTouchStart = (event) => {
    const { nativeEvent } = event;
    const { locationX, locationY } = nativeEvent;
    setCurrentPath(`M${locationX},${locationY}`);
  };

  const handleTouchEnd = () => {
    setPaths([...paths, currentPath]);
    setCurrentPath("");
  };

  const renderPaths = () => {
    return paths.map((path, index) => (
      <Path key={index} d={path} fill="none" stroke="black" strokeWidth="2" />
    ));
  };

  const clearCanvas = async () => {
    try {
      setPaths([]);
      await AsyncStorage.removeItem("drawings");
      if (user && user.id) {
        await deleteDrawingsFromServer();
      }
    } catch (error) {
      console.error("Failed to clear canvas", error);
    }
  };

  const deleteDrawingsFromServer = async () => {
    try {
      const response = await axios.delete(
        `${apiUrl}/delete-drawings/${user.id}`
      );
      console.log("Drawings deleted from server:", response.data);
    } catch (error) {
      if (error.response) {
        // Сервер вернул ответ с кодом состояния, который выходит за пределы диапазона 2xx
        console.error(
          "Server responded with status code:",
          error.response.status
        );
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        // Запрос был сделан, но ответа не получено
        console.error("No response received:", error.request);
      } else {
        // Что-то случилось при настройке запроса, вызвав ошибку
        console.error("Error setting up request:", error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Svg
        ref={svgRef}
        style={styles.canvas}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {renderPaths()}
        {currentPath !== "" && (
          <Path d={currentPath} fill="none" stroke="black" strokeWidth="2" />
        )}
      </Svg>
      <View style={styles.buttonContainer}>
        <Button title="Очистить" onPress={clearCanvas} />
        <Button title="Сохранить" onPress={saveDrawings} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  canvas: {
    flex: 1,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    padding: 10,
  },
});
