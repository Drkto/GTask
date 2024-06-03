import React, { useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  Image,
  Button,
  Alert,
  TextInput,
  LogBox,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import * as ImageManipulator from "expo-image-manipulator";
import { ApiUrlContext } from "./contexts/ApiUrlContext";
import Icon from "react-native-vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
//игнорируем ошибку
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);
//описание
function AttributesComponent() {
  const route = useRoute();
  const { itemData } = route.params;
  return (
    <ScrollView style={styles.main}>
      <Text
        selectable
        dataDetectorType="phoneNumber"
        style={styles.textContainer}
      >
        {JSON.stringify(itemData.Description).replace(/\\n/g, "\n")}
      </Text>
    </ScrollView>
  );
}
// конфигурационный блок исполнений
const BLOCK_CONFIGS = {
  installation: {
    title: "Монтаж",
    description: "Описание процесса монтажа.",
    sections: [
      { name: "layout", label: "Место монтажа", icon: "download" },
      { name: "terminal", label: "Терминал (внешний вид)", icon: "download" },
      { name: "serialnumber", label: "Оборудование (серийный номер)" },
      { name: "payment", label: "Оплата", icon: "download" },
      { name: "paymentkey", label: "Оплата 5001", icon: "download" },
      { name: "cancel", label: "Отмена", icon: "download" },
      {
        name: "finalCheck",
        label: "Финальная сверка итогов",
        icon: "download",
      },
      { name: "comment", label: "Описание работ" },
      { name: "doc", label: "Акт выполненных работ", icon: "download" },
    ],
  },
  dismantling: {
    title: "Демонтаж",
    description: "Описание процесса демонтажа.",
    sections: [
      // Добавьте соответствующие секции для демонтажа
      { name: "terminal", label: "Терминал (внешний вид)", icon: "download" },
      {
        name: "serialnumber",
        label: "Терминал (серийный номер)",
        icon: "download",
      },
      { name: "comment", label: "Описание работ" },
      { name: "doc", label: "Акт выполненных работ", icon: "download" },
    ],
  },
  restoration: {
    title: "Сервис",
    description: "Описание процесса сервиса.",
    sections: [
      // Добавьте соответствующие секции для восстановления
      {
        name: "serialnumber",
        label: "Терминал (серийный номер)",
        icon: "download",
      },
      { name: "payment", label: "Оплата", icon: "download" },
      { name: "paymentkey", label: "Оплата 5001", icon: "download" },
      { name: "cancel", label: "Отмена", icon: "download" },
      {
        name: "finalCheck",
        label: "Финальная сверка итогов",
        icon: "download",
      },
      { name: "comment", label: "Описание работ" },
      { name: "doc", label: "Акт выполненных работ", icon: "download" },
    ],
  },
  cancel: {
    title: "Отказ/Ложный",
    description: "Описание процесса отказа/ложного.",
    sections: [
      // Добавьте соответствующие секции для отказа/ложного

      { name: "comment", label: "Описание работ" },
      { name: "doc", label: "Акт выполненных работ", icon: "download" },
    ],
  },
};
//исполнение заявок
function JobsComponent({ requestNumber }) {
  const { apiUrl } = useContext(ApiUrlContext);
  const navigation = useNavigation();
  const [blockStates, setBlockStates] = useState(
    Object.keys(BLOCK_CONFIGS).reduce((acc, blockName) => {
      acc[blockName] = {
        images: {},
        serialNumbers: "",
        additionalSerialNumbers: [],
      };
      return acc;
    }, {})
  );

  const [openBlock, setOpenBlock] = useState(null);

  const pickImage = async (blockName, sectionName) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setBlockStates((prevStates) => ({
        ...prevStates,
        [blockName]: {
          ...prevStates[blockName],
          images: {
            ...prevStates[blockName].images,
            [sectionName]: [
              ...(prevStates[blockName].images[sectionName] || []),
              result.assets[0].uri,
            ],
          },
        },
      }));
    }
  };

  const deleteImage = (blockName, sectionName, imageIndex) => {
    setBlockStates((prevStates) => {
      const newImages = [...prevStates[blockName].images[sectionName]];
      newImages.splice(imageIndex, 1);
      return {
        ...prevStates,
        [blockName]: {
          ...prevStates[blockName],
          images: {
            ...prevStates[blockName].images,
            [sectionName]: newImages,
          },
        },
      };
    });
  };

  const handleCloseRequest = async () => {
    Alert.alert(
      "Закрыть заявку",
      "Вы уверены, что хотите закрыть заявку?",
      [
        {
          text: "Нет",
          onPress: () => console.log("Отмена закрытия заявки"),
          style: "cancel",
        },
        {
          text: "Да",
          onPress: async () => {
            const currentBlockConfig = BLOCK_CONFIGS[openBlock];
            const blockState = blockStates[openBlock];

            let errorMessage = "";

            // Проверка выбора работы
            if (
              !currentBlockConfig ||
              Object.keys(blockState.images).length === 0
            ) {
              errorMessage +=
                "Сначала приложите отчет по выполненной работе.\n";
            }

            if (errorMessage) {
              Alert.alert("Ошибка", errorMessage.trim());
              return;
            }

            // Отправка отчета на сервер
            try {
              // Ваш код отправки отчета на сервер
              await uploadAllImages(requestNumber, blockState.comments);

              // Вернуть пользователя на список заявок
              navigation.navigate("Заявки");
            } catch (error) {
              console.error("Ошибка при закрытии заявки", error);
              Alert.alert(
                "Ошибка",
                `Произошла ошибка при закрытии заявки: ${error.message}`
              );
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const uploadAllImages = async (requestNumber, description) => {
    const currentBlockConfig = BLOCK_CONFIGS[openBlock];
    const blockState = blockStates[openBlock];
    const sectionsWithImages = currentBlockConfig.sections.filter(
      (section) => section.name !== "serialnumber" && section.name !== "comment"
    );

    const missingSections = sectionsWithImages.filter(
      (section) =>
        !blockState.images[section.name] ||
        blockState.images[section.name].length === 0
    );

    let errorMessage = "";

    if (missingSections.length > 0) {
      const missingSectionLabels = missingSections
        .map((section) => section.label)
        .join(", ");
      errorMessage += `Необходимо загрузить фотографии для следующих секций: ${missingSectionLabels}\n`;
    }

    if (errorMessage) {
      throw new Error(errorMessage.trim());
    }

    try {
      const formData = new FormData();
      for (const blockName in blockStates) {
        for (const sectionName in blockStates[blockName].images) {
          if (
            sectionsWithImages.some((section) => section.name === sectionName)
          ) {
            for (const [index, imageUri] of blockStates[blockName].images[
              sectionName
            ].entries()) {
              const compressedImageUri = await compressImage(imageUri);
              if (compressedImageUri) {
                const fileName = `${requestNumber}_${currentBlockConfig.title}_${sectionName}_${index}.jpg`;
                formData.append(`${blockName}_${sectionName}_${index}`, {
                  uri: compressedImageUri,
                  name: fileName,
                  type: "image/jpg",
                });
              }
            }
          }
        }
      }

      const response = await axios.post(`${apiUrl}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          requestNumber: requestNumber, // Передача номера заявки в качестве параметра
          description: description,
        },
      });

      if (response.status === 200) {
        Alert.alert("Успех", "Все изображения успешно загружены");
      } else {
        throw new Error(
          "Failed to upload images: Server responded with status " +
            response.status
        );
      }
    } catch (error) {
      console.error("Ошибка при загрузке изображений", error);
      throw new Error(`Ошибка при загрузке изображений: ${error.message}`);
    }
  };

  const compressImage = async (uri) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.5, format: "jpeg" }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error("Failed to compress image", error);
      return null;
    }
  };

  const toggleBlock = (blockName) => {
    setOpenBlock(openBlock === blockName ? null : blockName);
  };

  return (
    <ScrollView style={styles.main}>
      {Object.entries(BLOCK_CONFIGS).map(([blockName, config]) => (
        <Block
          key={blockName}
          title={config.title}
          description={config.description}
          blockName={blockName}
          blockState={blockStates[blockName]}
          setBlockState={(newState) =>
            setBlockStates((prevStates) => ({
              ...prevStates,
              [blockName]: newState,
            }))
          }
          pickImage={pickImage}
          deleteImage={deleteImage}
          openBlock={openBlock}
          toggleBlock={toggleBlock}
        />
      ))}
      <Button title="Закрыть заявку" onPress={handleCloseRequest} />
    </ScrollView>
  );
}

const Block = ({
  title,
  description,
  blockName,
  blockState,
  setBlockState,
  pickImage,
  openBlock,
  toggleBlock,
  deleteImage,
}) => {
  const navigation = useNavigation();

  const handleScannedSerialNumber = (scannedNumber) => {
    setBlockState({ ...blockState, serialNumbers: scannedNumber });
  };

  const handleScannedAdditionalSerial = (scannedNumber, index) => {
    const updatedAdditionalSerialNumbers = [
      ...blockState.additionalSerialNumbers,
    ];
    updatedAdditionalSerialNumbers[index] = scannedNumber;
    setBlockState({
      ...blockState,
      additionalSerialNumbers: updatedAdditionalSerialNumbers,
    });
  };

  const addNewSerialNumberField = () => {
    setBlockState({
      ...blockState,
      additionalSerialNumbers: [...blockState.additionalSerialNumbers, ""],
    });
  };

  const handleCommentChange = (text) => {
    setBlockState({ ...blockState, comments: text });
  };

  return (
    <View style={styles.textContainer}>
      <TouchableOpacity onPress={() => toggleBlock(blockName)}>
        <View>
          <Text style={styles.BoldText}>{title}</Text>
        </View>
      </TouchableOpacity>
      {openBlock === blockName && (
        <View>
          <Text style={styles.description}>{description}</Text>
          {BLOCK_CONFIGS[blockName].sections.map((section) => (
            <View key={section.name} style={styles.textContainer}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.text}>{section.label}</Text>
                {section.name !== "serialnumber" &&
                  section.name !== "comment" && (
                    <TouchableOpacity
                      onPress={() => pickImage(blockName, section.name)}
                      style={[styles.imageContainer, { flexDirection: "row" }]}
                    >
                      <Icon
                        name={section.icon}
                        size={20}
                        color="#000"
                        style={{ marginLeft: 10 }}
                      />
                    </TouchableOpacity>
                  )}
              </View>
              {section.name === "serialnumber" ? (
                <>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Серийный номер"
                      value={blockState.serialNumbers}
                      onChangeText={(text) =>
                        setBlockState({ ...blockState, serialNumbers: text })
                      }
                    />
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("Scanner", {
                          onScan: handleScannedSerialNumber,
                          goBack: navigation.goBack,
                        })
                      }
                      style={styles.scanIcon}
                    >
                      <Icon name="scan1" size={20} style={{ marginLeft: 10 }} />
                    </TouchableOpacity>
                  </View>
                  {blockState.additionalSerialNumbers.map((number, index) => (
                    <View key={index} style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder={`Доп. серийный номер ${index + 1}`}
                        value={number}
                        onChangeText={(text) => {
                          const newAdditionalSerialNumbers = [
                            ...blockState.additionalSerialNumbers,
                          ];
                          newAdditionalSerialNumbers[index] = text;
                          setBlockState({
                            ...blockState,
                            additionalSerialNumbers: newAdditionalSerialNumbers,
                          });
                        }}
                      />
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("Scanner", {
                            onScan: (scannedNumber) =>
                              handleScannedAdditionalSerial(
                                scannedNumber,
                                index
                              ),
                            goBack: navigation.goBack,
                          })
                        }
                        style={styles.scanIcon}
                      >
                        <Icon
                          name="scan1"
                          size={20}
                          style={{ marginLeft: 10 }}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={addNewSerialNumberField}
                    style={{ marginTop: 10 }}
                  >
                    <Text>Добавить еще серийный номер</Text>
                  </TouchableOpacity>
                </>
              ) : section.name === "comment" ? (
                <TextInput
                  style={styles.input}
                  value={blockState.comments}
                  onChangeText={handleCommentChange}
                />
              ) : (
                <View style={styles.imageRow}>
                  {blockState.images[section.name]?.map((uri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri }} style={styles.image} />
                      <TouchableOpacity
                        style={styles.deleteIcon}
                        onPress={() =>
                          deleteImage(blockName, section.name, index)
                        }
                      >
                        <Icon name="closecircle" size={20} color="#FF0000" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default function FullScreenInfo() {
  const [currentScreen, setCurrentScreen] = useState("attributes");
  const route = useRoute();
  const { itemData } = route.params;
  const isArchive = itemData.Status === 1;
  return (
    <View style={styles.container}>
      <View style={styles.mainButton}>
        <View style={styles.navBox}>
          <View style={styles.box}>
            <TouchableOpacity onPress={() => setCurrentScreen("attributes")}>
              <Text
                style={[
                  styles.textButton,
                  currentScreen === "attributes" ? styles.activeBox : null,
                ]}
              >
                Атрибуты
              </Text>
            </TouchableOpacity>
            {!isArchive && ( // Скрыть кнопку "Работы" для архивных заявок
              <TouchableOpacity onPress={() => setCurrentScreen("jobs")}>
                <Text
                  style={[
                    styles.textButton,
                    currentScreen === "jobs" ? styles.activeBox : null,
                  ]}
                >
                  Работы
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      {currentScreen === "attributes" && <AttributesComponent />}
      {currentScreen === "jobs" && !isArchive && (
        <JobsComponent requestNumber={itemData.Number} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  phoneNumber: {
    color: "#4287f5",
  },
  main: {
    backgroundColor: "#e3e3e3",
    flex: 1,
  },
  textContainer: {
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
  activeBox: {
    backgroundColor: "#4287f5",
    color: "white",
  },
  mainButton: {
    backgroundColor: "#ffff",
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
  BoldText: {
    fontWeight: "bold",
    margin: 5,
  },
  description: {
    padding: 10,
    fontStyle: "italic",
    color: "#666",
    marginLeft: 5,
  },
  text: {
    fontSize: 16,
  },
  imageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 10,
    marginBottom: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  deleteIcon: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: "black",
    padding: 5,
    backgroundColor: "#fff",
  },
  scanIcon: {
    padding: 5,
  },
});
