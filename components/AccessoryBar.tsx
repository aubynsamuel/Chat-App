import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import Animated, { FadeInLeft } from "react-native-reanimated";

import {
  getLocationAsync,
  pickImageAsync,
  takePictureAsync,
} from "./mediaUtils";

// Define interfaces for type safety
interface User {
  userId: string;
  username: string;
}

interface ButtonProps {
  onPress: () => void;
  size?: number;
  color?: string;
  name: string;
}

interface AccessoryBarProps {
  onSend: (messages: any[]) => void;
  uploadMediaFile: (
    media: { uri: string },
    username: string
  ) => Promise<string | null>;
  user: User;
  openPicker: (type: string) => void;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  size = 27,
  color = "rgba(0,0,0,0.9)",
  name,
}) => (
  <TouchableOpacity onPress={onPress}>
    <MaterialIcons size={size} color={color} name={name as any} />
  </TouchableOpacity>
);

const AccessoryBar: React.FC<AccessoryBarProps> = ({
  onSend,
  uploadMediaFile,
  user,
  openPicker,
}) => {
  return (
    <Animated.View style={styles.container} entering={FadeInLeft.duration(250)}>
      <Button
        onPress={() => openPicker("images")}
        // onPress={() => pickImageAsync(onSend, user, uploadMediaFile)}
        name="image"
      />
      {/* <Button
        onPress={() => takePictureAsync(onSend, user, uploadMediaFile)}
        name="camera-alt"
      /> */}
      <Button
        onPress={() => getLocationAsync(onSend, user)}
        name="add-location-alt"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    width: "10%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    bottom: 2,
    gap: 3,
    marginHorizontal: 8,
    borderTopColor: "rgba(0,0,0,0.3)",
  },
});

export default AccessoryBar;
