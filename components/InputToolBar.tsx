import { Text, View, ViewStyle } from "react-native";
import React, { memo, useCallback, useMemo, MutableRefObject } from "react";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { InputToolbar } from "react-native-gifted-chat";
import RenderAudioButton from "./RecordAudioButton";
import { IMessage } from "../Functions/types";
import { darkTheme, useAuth } from "../imports";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Theme } from "@/context/ThemeContext";
import { activeTouchableOpacity } from "@/Functions/Constants";

interface InputToolBarProps {
  isReplying: boolean;
  setIsReplying: (value: boolean) => void;
  selectedTheme: Theme;
  showActions: MutableRefObject<boolean>;
  isEditing: boolean;
  props: any;
  handleSend: (newMessages?: IMessage[]) => Promise<void>;
  replyToMessage?: IMessage | null;
  setReplyToMessage: React.Dispatch<React.SetStateAction<IMessage | null>>;
}

const ReplyPreview = memo(
  ({
    message,
    selectedTheme,
    username,
    onClose,
  }: {
    message: IMessage;
    selectedTheme: Theme;
    username: string | undefined;
    onClose: () => void;
  }) => {
    const getReplyPreview = useCallback((message: IMessage) => {
      switch (message.type) {
        case "text":
          return message.text;
        case "image":
          return "📷 Image";
        case "audio":
          return `🔊 ${message.duration}` || "🔊 Audio";
        case "location":
          return "🌍 Location";
        default:
          return "";
      }
    }, []);

    const preview = useMemo(
      () => getReplyPreview(message),
      [message, getReplyPreview]
    );
    const displayName = useMemo(
      () => (message.user.name === username ? "Yourself" : message.user.name),
      [message.user.name, username]
    );

    return (
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
          <TouchableOpacity
            activeOpacity={activeTouchableOpacity}
            style={{ alignSelf: "center", bottom: 5 }}
          >
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
              Replying to {displayName}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: selectedTheme.text.secondary,
                width: "100%",
              }}
            >
              {preview.length > 38 ? preview.substring(0, 38) + "..." : preview}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={activeTouchableOpacity}
          style={{ alignSelf: "center" }}
          onPress={onClose}
        >
          <MaterialIcons
            name="close"
            size={24}
            color={selectedTheme.text.primary}
            style={{ marginRight: 5 }}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const InputToolBar = memo(
  ({
    isReplying,
    setIsReplying,
    selectedTheme,
    showActions,
    isEditing,
    props,
    replyToMessage,
    setReplyToMessage,
  }: InputToolBarProps) => {
    const { user } = useAuth();

    const handleCloseReply = useCallback(() => {
      setIsReplying(false);
      setReplyToMessage?.(null);
    }, [isReplying]);

    const containerStyle = useMemo(
      () => ({
        backgroundColor: isReplying
          ? selectedTheme === darkTheme
            ? selectedTheme.background
            : selectedTheme.primary
          : null,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
      }),
      [isReplying, selectedTheme]
    );

    const toolbarStyle: ViewStyle = useMemo(
      () => ({
        width:
          isEditing || isReplying || !showActions.current ? "97.5%" : "85%",
        alignSelf: "flex-start",
        borderRadius: 30,
        marginBottom: 8,
        marginTop: 0,
        borderTopColor:
          selectedTheme === darkTheme ? selectedTheme.surface : "white",
        backgroundColor:
          selectedTheme === darkTheme ? selectedTheme.surface : "white",
      }),
      [isEditing, isReplying, showActions.current]
    );

    return (
      <View>
        {isReplying && replyToMessage && (
          <ReplyPreview
            message={replyToMessage}
            selectedTheme={selectedTheme}
            username={user?.username}
            onClose={handleCloseReply}
          />
        )}

        <View style={containerStyle as ViewStyle}>
          <InputToolbar {...props} containerStyle={toolbarStyle} />
          <View
            style={{
              position:
                showActions.current && !isEditing && !isReplying
                  ? "relative"
                  : "absolute",
              opacity: showActions.current && !isEditing && !isReplying ? 1 : 0,
              top:
                showActions.current && !isEditing && !isReplying ? null : 100,
            }}
          >
            <RenderAudioButton />
          </View>
        </View>
      </View>
    );
  }
);

export default InputToolBar;
