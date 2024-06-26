import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function App({ route }) {
  const navigation = useNavigation();
  const { onScan, goBack } = route.params; // Получаем функцию обратного вызова через параметры маршрута
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          Нам нужно ваше разрешение, чтобы показать камеру
        </Text>
        <Button onPress={requestPermission} title="Дать разрешение" />
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    onScan(data); // Вызываем функцию обратного вызова и передаем сканированное значение
    if (goBack) {
      goBack(); // Если определена функция goBack, вызываем ее для возврата назад
    } else {
      navigation.navigate("Оборудование"); // Если нет, используем навигацию для возврата
    }
  };
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: [
            "aztec",
            "ean13",
            "ean8",
            "qr",
            "pdf417",
            "upc_e",
            "datamatrix",
            "code39",
            "code93",
            "itf14",
            "codabar",
            "code128",
            "upc_a",
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.buttonContainer}>
          {scanned && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.text}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
