import { View, Text, StyleSheet } from "react-native";
import React from "react";
import LottieView from "lottie-react-native";

const EmptyChatRoomList = () => {
  return (
    <View style={{ flex: 1, }}>
      <LottieView
        source={require("../../myAssets/Lottie_Files/Animation - 1730912642416.json")}
        autoPlay
        loop={true}
        style={styles.lottieImage}
      />
      <Text style={styles.text}>No messages yet</Text>
      <Text style={styles.text}>Send a message to start a conversation</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    textAlign: "center",
    color: "white",
  },
  lottieImage: {
    flex: 0.8,
    width: 90 * 2,
    height: 90 * 2,
    alignSelf: "center",
    color: "red",
  },
});

export default EmptyChatRoomList;
