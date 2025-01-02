import { Text, View } from "react-native";
import React, { memo } from "react";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { InputToolbar } from "react-native-gifted-chat";
import RenderAudioButton from "./RecordAudioButton";
import { IMessage } from "../Functions/types";
import { darkTheme, useAuth } from "../imports";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Theme } from "@/context/ThemeContext";

interface InputToolBarProps {
  isReplying: boolean;
  setIsReplying: (value: boolean) => void;
  selectedTheme: Theme;
  showActions: boolean;
  isEditing: boolean;
  props: any;
  handleSend: (newMessages?: IMessage[]) => Promise<void>;
  replyToMessage?: IMessage | null;
  setReplyToMessage: React.Dispatch<React.SetStateAction<IMessage | null>>;
}

const InputToolBar = memo(
  ({
    isReplying,
    setIsReplying,
    selectedTheme,
    showActions,
    isEditing,
    props,
    handleSend,
    replyToMessage,
    setReplyToMessage,
  }: InputToolBarProps) => {
    const { user } = useAuth();

    const getReplyPreview = (message: IMessage) => {
      if (message.type === "text") return message.text;
      if (message.type === "image") return "📷 Image";
      if (message.type === "audio") return "🔊 Audio";
      if (message.type === "location") return "📍 Location";
      return "";
    };

    return (
      <View>
        {/* Reply to message UI */}
        {isReplying && replyToMessage && (
          <Animated.View
            entering={FadeInDown.duration(200)}
            style={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
              backgroundColor:
                selectedTheme === darkTheme
                  ? selectedTheme.background
                  : selectedTheme.primary,
              alignItems: "center",
              paddingHorizontal: 15,
              paddingTop: 5,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                width: "94%",
              }}
            >
              <TouchableOpacity style={{ alignSelf: "center" }}>
                <MaterialIcons
                  name="reply"
                  size={28}
                  color={selectedTheme.text.primary}
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 35,
                  alignSelf: "flex-start",
                  bottom: 5,
                  color: selectedTheme.text.primary,
                }}
              >
                |
              </Text>
              <View style={{ height: 50, gap: 3 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    color: selectedTheme.text.primary,
                  }}
                >
                  Replying to{" "}
                  {replyToMessage.user.name === user?.username
                    ? "Yourself"
                    : replyToMessage.user.name}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    color: selectedTheme.text.secondary,
                    maxWidth: "90%",
                  }}
                >
                  {getReplyPreview(replyToMessage)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={{ alignSelf: "center" }}
              onPress={() => {
                setIsReplying(false);
                setReplyToMessage?.(null);
              }}
            >
              <MaterialIcons
                name="close"
                size={24}
                color={selectedTheme.text.primary}
                style={{
                  marginRight: 5,
                }}
              />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Input toolbar and microphone */}
        <View
          style={
            {
              backgroundColor: isReplying
                ? selectedTheme === darkTheme
                  ? selectedTheme.background
                  : selectedTheme.primary
                : null,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            } as any
          }
        >
          <InputToolbar
            {...props}
            containerStyle={{
              width: isEditing || isReplying || !showActions ? "97.5%" : "85%",
              alignSelf: "flex-start",
              borderRadius: 30,
              marginBottom: 8,
              marginTop: 0,
            }}
          />
          {!isEditing && !isReplying && showActions && (
            <RenderAudioButton handleSend={handleSend} />
          )}
        </View>
      </View>
    );
  }
);

export default InputToolBar;
