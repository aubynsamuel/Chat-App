import React, { memo, useCallback } from "react";
import * as Linking from "expo-linking";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

// Define interfaces for type safety
interface Location {
  latitude: number;
  longitude: number;
}

interface Message {
  location?: Location;
}

interface CustomViewProps {
  currentMessage: Message;
  containerStyle?: ViewStyle;
  mapViewStyle?: ViewStyle;
}

const CustomView: React.FC<CustomViewProps> = memo(({
  currentMessage,
  containerStyle,
  mapViewStyle,
}) => {
  const openMapAsync = useCallback(async () => {
    const { location = {} as Location } = currentMessage;

    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${location.latitude},${location.longitude}`,
      default: `http://maps.google.com/?q=${location.latitude},${location.longitude}`,
    });

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) return Linking.openURL(url);

      alert("Opening the map is not supported.");
    } catch (e) {
      alert(String(e));
    }
  }, [currentMessage]);

  if (currentMessage.location) {
    const { latitude, longitude } = currentMessage.location;

    // Add some validation
    if (!latitude || !longitude) {
      console.error("Invalid location data", currentMessage.location);
      return null;
    }

    return (
      <TouchableOpacity
        style={[styles.container, containerStyle]}
        onPress={openMapAsync}
        activeOpacity={0.8}
      >
        <MapView
          style={[styles.mapView, mapViewStyle]}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude,
              longitude,
            }}
          />
        </MapView>
      </TouchableOpacity>
    );
  }

  return null;
});

export default CustomView;

const styles = StyleSheet.create({
  container: { 
    overflow: "hidden", 
    borderRadius: 13,
    width: 150,
    height: 100,
  },
  mapView: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
});