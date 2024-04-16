import React, { useState, useEffect, useRef } from 'react';
import {Text, View, StyleSheet} from 'react-native';
import MapView, { Marker} from 'react-native-maps';
import * as Location from 'expo-location';

export default function GoogleMaps() {
    const [location, setLocation] = useState(null);
    const mapRef = useRef(null);
  
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    useEffect(() => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
        }
    }, [location]);
    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={location ? {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                } : undefined}
            >
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        title='Инженер'
                        pinColor="#4287f5"
                    />
                )}
            </MapView>
        </View>
    );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main:{
    backgroundColor:'#e3e3e3',
    flex: 1
  },
  map: {
    flex: 1,
  },
  });
