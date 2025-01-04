import React, { memo, useState } from "react";
import {
  Image,
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Text,
  ImageStyle,
  TextStyle,
  ViewStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { MessageImageProps } from "react-native-gifted-chat";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { UserData } from "@/context/AuthContext";
import { IMessage } from "@/Functions/types";

// Define interfaces for type safety

interface RenderMessageImageProps {
  imageStyle?: ImageStyle;
  setReplyToMessage: React.Dispatch<React.SetStateAction<IMessage | null>>;
  setIsReplying: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: (message: IMessage) => Promise<void>;

  props: MessageImageProps<IMessage>;
  user: UserData | null;
  setEditText: React.Dispatch<React.SetStateAction<string>>;
  setEditMessage: React.Dispatch<
    React.SetStateAction<IMessage | null | undefined>
  >;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const RenderMessageImage: React.FC<RenderMessageImageProps> = memo(
  ({
    imageStyle,
    props,
    setReplyToMessage,
    setIsReplying,
    handleDelete,
    setEditText,
    setEditMessage,
    setIsEditing,
    user,
  }) => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const { showActionSheetWithOptions } = useActionSheet();
    const { currentMessage } = props;

    if (!currentMessage.image) return null;

    const handleMessagePress = (currentMessage: IMessage) => {
      const options = ["Reply"];

      if (currentMessage.user._id === user?.userId) {
        options.push("Edit Caption");
        options.push("Delete Picture");
      }
      options.push("Cancel");
      const cancelButtonIndex = options.length - 1;

      const title = `📷 Caption: ${
        currentMessage.text.length > 80
          ? currentMessage.text.substring(0, 80) + "..."
          : currentMessage.text
      }`;
      const textStyle: TextStyle = {
        textAlign: "center",
        alignSelf: "center",
        width: "100%",
        fontWeight: "500",
      };
      const destructiveColor = "red";
      const destructiveButtonIndex = 2;
      const titleTextStyle: TextStyle = {
        fontWeight: "400",
        textAlign: "center",
        color: "#000",
      };
      const containerStyle: ViewStyle = {
        alignItems: "center",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      };
      const showSeparators = true;
      showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title,
          titleTextStyle,
          containerStyle,
          textStyle,
          destructiveColor,
          destructiveButtonIndex,
          showSeparators,
        },
        (buttonIndex: number | undefined) => {
          switch (buttonIndex) {
            case 0: {
              setReplyToMessage(currentMessage);
              setIsReplying(true);
              break;
            }
            case 1:
              if (currentMessage.user._id === user?.userId) {
                setIsEditing(true);
                setEditMessage(currentMessage);
                setEditText(currentMessage.text);
              }
              break;
            case 2:
              if (currentMessage.user._id === user?.userId)
                handleDelete(currentMessage);
              break;
            default:
              break;
          }
        }
      );
    };

    return (
      <>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          onLongPress={() => handleMessagePress(currentMessage)}
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
              <MaterialIcons name="close" size={24} color="white" />
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
  }
);

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
