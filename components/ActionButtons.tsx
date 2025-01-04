import { MaterialIcons } from "@expo/vector-icons";
import React, { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Alert } from "react-native";
import { useChatContext } from "../context/ChatContext";

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

interface ActionButtonsProps {
  onSend: (messages: any[]) => void;
  uploadMediaFile: (
    media: {
      uri: string | URL | Request;
    },
    username: string
  ) => Promise<string | null | undefined>;
  user: User;
  openPicker: (SelectType: any) => Promise<void>;
  recipient: string | null;
}

const Button: React.FC<ButtonProps> = memo(
  ({ onPress, size = 27, color = "rgba(0,0,0,0.9)", name }) => (
    <TouchableOpacity onPress={onPress}>
      <MaterialIcons size={size} color={color} name={name as any} />
    </TouchableOpacity>
  )
);

const ActionButtons: React.FC<ActionButtonsProps> = memo(
  ({ onSend, user, openPicker, recipient }) => {
    const { getLocationAsync } = useChatContext();

    const confirmAndShareLocation = (
      onSend: (messages: any[]) => void,
      user: User,
      name: string | null
    ) => {
      Alert.alert(
        "Share Location",
        `You are about to share your location with ${name}. Do you want to continue?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Continue",
            onPress: () => getLocationAsync(onSend, user),
          },
        ],
        { cancelable: true }
      );
    };

    return (
      <View style={styles.container}>
        <Button
          onPress={() => {
            openPicker("images");
          }}
          name="image"
        />
        <Button
          onPress={() => confirmAndShareLocation(onSend, user, recipient)}
          name="add-location-alt"
        />
      </View>
    );
  }
);

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

export default ActionButtons;
