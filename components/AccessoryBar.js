import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import {
  getLocationAsync,
  pickImageAsync,
  takePictureAsync,
} from "./mediaUtils";

export default AccessoryBar = ({ onSend, uploadMediaFile, user }) => {
  return (
    <View style={styles.container}>
      <Button
        onPress={() => pickImageAsync(onSend, user, uploadMediaFile)}
        name="camera-alt"
      />
      {/* <Button
        onPress={() => takePictureAsync(onSend, user, uploadMediaFile)}
        name="camera-alt"
      /> */}
      <Button
        onPress={() => getLocationAsync(onSend, user)}
        name="add-location-alt"
      />
    </View>
  );
};

const Button = ({ onPress, size = 27, color = "rgba(0,0,0,0.9)", name }) => (
  <TouchableOpacity onPress={onPress}>
    <MaterialIcons size={size} color={color} name={name} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    height: 44,
    width: "10%",
    // backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    // borderTopWidth: StyleSheet.hairlineWidth,
    bottom:2,
    gap:3,
    marginHorizontal:8,
    borderTopColor: "rgba(0,0,0,0.3)",
  },
});
