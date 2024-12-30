import { View, Text, StyleSheet } from "react-native";
import React from "react";
import LottieView from "lottie-react-native";
import { EmptyChatRoom } from "../imports";

const EmptyChatRoomList = () => {
  return (
    <View>
      <LottieView
        source={EmptyChatRoom}
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
    width: 90 * 2,
    height: 90 * 2,
    alignSelf: "center",
    color: "red",
  },
});

export default EmptyChatRoomList;
