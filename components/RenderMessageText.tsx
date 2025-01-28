import { TouchableOpacity, Text, View } from "react-native";
import { MessageText, MessageTextProps } from "react-native-gifted-chat";
import { IMessage } from "../Functions/types";
import { UserData } from "../context/AuthContext";
import { Theme } from "../context/ThemeContext";
import { memo } from "react";
import { darkTheme } from "@/imports";
import { activeTouchableOpacity } from "@/Functions/Constants";

const RenderMessageText = memo(
  ({
    props,
    scrollToMessage,
    selectedTheme,
    user,
  }: {
    props: MessageTextProps<IMessage>;
    scrollToMessage: (message?: string | number) => void;
    selectedTheme: Theme;
    user: UserData | null;
  }) => {
    const { currentMessage } = props;

    return (
      <View>
        {/* Display replied-to message if available */}
        {currentMessage.replyTo && (
          <TouchableOpacity
            activeOpacity={activeTouchableOpacity}
            onPress={() => scrollToMessage(currentMessage.replyTo?._id)}
            style={
              {
                backgroundColor:
                  currentMessage.user._id === user?.userId
                    ? selectedTheme === darkTheme
                      ? selectedTheme.secondary
                      : selectedTheme.background
                    : selectedTheme === darkTheme
                    ? "#121212"
                    : selectedTheme.background,
                borderTopRightRadius:
                  currentMessage.user._id === user?.userId ? null : 10,
                borderTopLeftRadius:
                  currentMessage.user._id === user?.userId ? 10 : null,
                borderRadius: 8,
                margin: 4,
                paddingHorizontal: 5,
                paddingVertical: 3,
                borderRightWidth:
                  currentMessage.user._id === user?.userId ? 4 : 0,
                borderLeftWidth:
                  currentMessage.user._id === user?.userId ? 0 : 4,
                borderColor:
                  currentMessage.user._id === user?.userId
                    ? selectedTheme === darkTheme
                      ? selectedTheme.background
                      : selectedTheme.secondary
                    : selectedTheme.secondary,
              } as any
            }
          >
            {/* Name of the replier */}
            <Text
              style={{
                fontSize: 11,
                color:
                  selectedTheme === darkTheme
                    ? "white"
                    : selectedTheme.secondary,
                fontWeight: "bold",
                // fontStyle: "italic",
              }}
              numberOfLines={1}
            >
              {currentMessage.replyTo.user?.name === user?.username
                ? "You"
                : currentMessage.replyTo.user.name}
            </Text>

            {/* Message Replied To */}
            <Text
              numberOfLines={2}
              style={{
                fontSize: 13,
                color: selectedTheme.text.primary,
              }}
            >
              {currentMessage.replyTo.type === "text"
                ? currentMessage.replyTo.text
                : currentMessage.replyTo.type === "image"
                ? "📷 Image"
                : currentMessage.replyTo.type === "audio"
                ? `🔊 ${
                    currentMessage.duration ? currentMessage.duration : "audio"
                  }`
                : "Unknown Content"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Original message */}
        <MessageText
          {...props}
          textStyle={{
            left: {
              color:
                selectedTheme === darkTheme
                  ? "white"
                  : selectedTheme.message.other.text,
              fontSize: 15,
            },
            right: { color: selectedTheme.message.user.text, fontSize: 15 },
          }}
          linkStyle={{
            left: { color: selectedTheme.text.primary },
            right: { color: selectedTheme.text.primary },
          }}
        />
      </View>
    );
  }
);

export default RenderMessageText;
