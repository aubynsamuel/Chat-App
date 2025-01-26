import React, { memo, useState } from "react";
import {
  Image,
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../imports";
import { StatusBar } from "expo-status-bar";
import { IMessage } from "../Functions/types";
import ScreenOverlay from "./ScreenOverlay";
import { useChatContext } from "../context/ChatContext";

export interface MediaFile {
  uri: string;
}

interface ImageMessageDetailsProps {
  handleSend: (messages?: IMessage[]) => Promise<void>;
  image: string;
  uploadMediaFile: (
    media: MediaFile,
    username: string
  ) => Promise<string | null>;
}

const ImageMessageDetails: React.FC<ImageMessageDetailsProps> = memo(
  ({ handleSend, image, uploadMediaFile }) => {
    const [caption, setCaption] = useState<string>("");
    const { user } = useAuth();
    const { imageModalVisibility, setImageModalVisibility } = useChatContext();
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

        const newMessage: IMessage = {
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
      <ScreenOverlay
        showIndicator={false}
        containerStyles={{
          top: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,10)",
          paddingBottom: 0,
        }}
        children={
          <Modal
            visible={imageModalVisibility}
            transparent={true}
            onRequestClose={() => setImageModalVisibility(false)}
          >
            {imageModalVisibility ? (
              <StatusBar style="light" backgroundColor="black" />
            ) : null}

            {/* View Content */}
            <View style={{ height: "100%", justifyContent: "center" }}>
              {/* Close button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setImageModalVisibility(false)}
              >
                <MaterialIcons name="close" size={24} color="white" />
              </TouchableOpacity>

              {/* Image and loading indicator */}
              <>
                {isLoading && (
                  <ActivityIndicator
                    size={45}
                    color={"white"}
                    style={styles.activityIndicator}
                  />
                )}

                <Image
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </>

              {/* Caption field and send button */}
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
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        }
      />
    );
  }
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.99)",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "90%",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 10,
  },
  captionAndSend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 5,
    alignSelf: "center",
    paddingHorizontal: 10,
  },
  captionContainer: {
    width: "88%",
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
    borderRadius: 5,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  activityIndicator: {
    position: "absolute",
    zIndex: 10,
    alignSelf: "center",
  },
});

export default ImageMessageDetails;
