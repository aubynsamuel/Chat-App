import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export async function getLocationAsync(onSend, user) {
  const response = await Location.requestForegroundPermissionsAsync();
  if (!response.granted) return;

  const location = await Location.getCurrentPositionAsync();
  if (!location) return;

  const locationMessage = {
    _id: Math.random().toString(36).substring(7),
    text: `Lat:${location.coords.latitude.toFixed(4)}\nLong:${location.coords.longitude.toFixed(4)}`,
    createdAt: new Date(),
    user: {
      _id: user.userId,
      name: user.username,
    },
    location: {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    },
    type: "location",
    received: true,
  };

  onSend([locationMessage]);
}

export async function pickImageAsync(onSend, user, uploadMediaFile) {
  const response = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!response.granted) return;

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    quality: 1,
    mediaTypes: ["images"],
  });

  if (result.canceled) return;

  const mediaAsset = result.assets[0];

  try {
    // Upload the image and get the download URL
    const downloadURL = await uploadMediaFile(
      { uri: mediaAsset.uri },
      user.username
    );

    if (downloadURL) {
      const imageMessage = {
        _id: Math.random().toString(36).substring(7),
        text: null, // TODO: will be used for image caption
        image: downloadURL,
        createdAt: new Date(),
        user: {
          _id: user.userId,
          name: user.username,
        },
        type: "image",
        received: true,
      };

      onSend([imageMessage]);
    }
  } catch (error) {
    console.error("Failed to upload image:", error);
    Alert.alert("Error", "Failed to upload image. Please try again.");
  }
}

export async function takePictureAsync(onSend, user, uploadMediaFile) {
  const response = await ImagePicker.requestCameraPermissionsAsync();
  if (!response.granted) return;

  const result = await ImagePicker.launchCameraAsync({
    quality: 1,
    aspect: [4, 3],
  });

  if (result.canceled) return;

  const mediaAsset = result.assets[0];

  try {
    // Upload the image and get the download URL
    const downloadURL = await uploadMediaFile(
      { uri: mediaAsset.uri },
      user.username
    );

    if (downloadURL) {
      const imageMessage = {
        _id: Math.random().toString(36).substring(7),
        text: "", // TODO: will be used for image caption
        image: downloadURL,
        createdAt: new Date(),
        user: {
          _id: user.userId,
          name: user.username,
        },
        type: "image",
        received: true,
      };

      onSend([imageMessage]);
    }
  } catch (error) {
    console.error("Failed to take and upload image:", error);
    Alert.alert("Error", "Failed to take and upload image. Please try again.");
  }
}
