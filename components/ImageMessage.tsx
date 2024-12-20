import React, { memo, useState } from "react";
import {
  Image,
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Text,
  ImageStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// Define interfaces for type safety
interface Message {
  image?: string;
  text?: string;
}

interface RenderMessageImageProps {
  currentMessage: Message;
  imageStyle?: ImageStyle;
}

const RenderMessageImage: React.FC<RenderMessageImageProps> = memo(({
  currentMessage,
  imageStyle,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  if (!currentMessage.image) return null;

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: currentMessage.image }}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        {modalVisible ? (
          <StatusBar style="dark" backgroundColor="black" />
        ) : null}
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <MaterialIcons name="close" size={30} color="white" />
          </TouchableOpacity>

          <Image
            source={{ uri: currentMessage.image }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
          {currentMessage.text && (
            <Text style={{ color: "white", fontSize: 18 }}>
              {currentMessage.text}
            </Text>
          )}
        </View>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  image: {
    width: 210,
    height: 250,
    borderRadius: 13,
    resizeMode: "cover",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "85%",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 10,
  },
});

export default RenderMessageImage;
