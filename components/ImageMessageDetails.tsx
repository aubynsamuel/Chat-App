import React, { useState } from "react";
import {
  Image,
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth, useTheme } from "../imports";
import { StatusBar } from "expo-status-bar";

// Define types for the message and upload file
interface MediaFile {
  uri: string;
}
interface Message {
  _id: string;
  text: string;
  image?: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
  };
  type: string;
  delivered: boolean;
}

interface ImageMessageDetailsProps {
  handleSend: (messages: Message[]) => void;
  image: string;
  uploadMediaFile: (
    media: MediaFile,
    username: string
  ) => Promise<string | null>;
}

const ImageMessageDetails: React.FC<ImageMessageDetailsProps> = ({
  handleSend,
  image,
  uploadMediaFile,
}) => {
  const [caption, setCaption] = useState<string>("");
  const { user, imageModalVisibility, setImageModalVisibility } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sendImageMessage = async () => {
    setIsLoading(true);
    try {
      console.log("Sending image message", image);

      // Validate image and user
      if (!image || !user) {
        Alert.alert(
          "Error sending image",
          "An error occurred when sending message, Please try again"
        );
        setIsLoading(false);
        return;
      }

      const downloadURL = await uploadMediaFile(
        { uri: image },
        user.username as string
      );

      if (!downloadURL) {
        setIsLoading(false);
        Alert.alert(
          "Error sending image",
          "An error occurred when sending message, Please try again"
        );
        return;
      }

      const newMessage: Message = {
        _id: Math.random().toString(36).substring(7),
        text: caption || "",
        image: downloadURL,
        createdAt: new Date(),
        user: {
          _id: user.userId,
          name: user.username as string,
        },
        type: "image",
        delivered: true,
      };

      // Send message and close modal
      handleSend([newMessage]);
      setIsLoading(false);
      setImageModalVisibility(false);
    } catch (error) {
      console.error("Error sending image message:", error);
    }
  };

  return (
    <Modal
      visible={imageModalVisibility}
      transparent={true}
      onRequestClose={() => setImageModalVisibility(false)}
    >
      {imageModalVisibility ? (
        <StatusBar style="dark" backgroundColor="black" />
      ) : null}

      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setImageModalVisibility(false)}
        >
          <MaterialIcons name="close" size={30} color="white" />
        </TouchableOpacity>
        <>
          {isLoading && (
            <ActivityIndicator
              size={"large"}
              color={"white"}
              style={styles.loadingSpinnerContainer}
            />
          )}
          <Image
            source={{ uri: image }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </>

        <View style={styles.captionAndSend}>
          <View style={styles.captionContainer}>
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              placeholderTextColor="white"
              multiline={true}
              numberOfLines={5}
              onChangeText={(text) => setCaption(text)}
            />
          </View>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendImageMessage}
          >
            <MaterialIcons name="send" size={28} color={"white"} />
            {/* <Text>Send</Text> */}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.99)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  captionAndSend: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 5,
  },
  captionContainer: {
    width: "90%",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  captionInput: {
    fontSize: 16,
    // height: 40,
    width: "100%",
    color: "white",
  },
  sendButton: {
    // backgroundColor: "#4CAF50",
    borderRadius: 5,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingSpinnerContainer: {
    position: "absolute",
    zIndex: 10,
  },
});

export default ImageMessageDetails;
