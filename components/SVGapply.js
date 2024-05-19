import React, { useState, useRef } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';


export default function App() {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const svgRef = useRef(null);

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
    setCurrentPath('');
  };

  const renderPaths = () => {
    return paths.map((path, index) => <Path key={index} d={path} fill="none" stroke="black" strokeWidth="2" />);
  };

  const clearCanvas = () => {
    setPaths([]);
  };

  const saveDrawing = async () => {
    try {
      const svgData = `
        <svg height="200" width="200">
          ${paths.map(path => `<path d="${path}" fill="none" stroke="black" stroke-width="2" />`).join('')}
        </svg>
      `;
      const svgFileName = FileSystem.documentDirectory + 'drawing.svg';
      await FileSystem.writeAsStringAsync(svgFileName, svgData);
      await Sharing.shareAsync(svgFileName);
    } catch (error) {
      console.error('Error saving drawing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Svg ref={svgRef} style={styles.canvas} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {renderPaths()}
        {currentPath !== '' && <Path d={currentPath} fill="none" stroke="black" strokeWidth="2" />}
      </Svg>
      <View style={styles.buttonContainer}>
        <Button title="Очистить" onPress={clearCanvas} />
        <Button title="Сохранить" onPress={saveDrawing} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 10,
  },
});