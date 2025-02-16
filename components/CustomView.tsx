import React, { memo, useCallback } from "react";
import * as Linking from "expo-linking";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { IMessage } from "../Functions/types";
import { activeTouchableOpacity } from "@/Functions/Constants";

interface CustomViewProps {
  currentMessage: IMessage;
  containerStyle?: ViewStyle;
  mapViewStyle?: ViewStyle;
}

const CustomView: React.FC<CustomViewProps> = memo(
  ({ currentMessage, containerStyle, mapViewStyle }) => {
    const openMapAsync = useCallback(async () => {
      const { location } = currentMessage;

      const url = Platform.select({
        ios: `http://maps.apple.com/?ll=${location?.latitude},${location?.longitude}`,
        default: `http://maps.google.com/?q=${location?.latitude},${location?.longitude}`,
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

      if (!latitude || !longitude) {
        console.error("Invalid location data", currentMessage.location);
        return null;
      }

      return (
        <TouchableOpacity
          activeOpacity={activeTouchableOpacity}
          style={[styles.container, containerStyle]}
          onPress={openMapAsync}
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
  }
);

export default CustomView;

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 13,
    width: 150,
    height: 100,
  },
  mapView: {
    width: "100%",
    height: "100%",
    borderRadius: 13,
  },
});
