import { StyleSheet, Text, View, Animated } from "react-native";
import React, { memo, useCallback, useRef } from "react";
import { Bubble, BubbleProps } from "react-native-gifted-chat";
import { IMessage } from "@/Functions/types";
import { useAuth } from "@/imports";
import { useTheme } from "@/imports";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { useChatContext } from "@/context/ChatContext";

const RenderBubble = memo(
  ({ props }: { props: Readonly<BubbleProps<IMessage>> }) => {
    const { user } = useAuth();
    const { currentMessage } = props;
    const { selectedTheme } = useTheme();
    const swipeableRef = useRef<any>(null);
    const { setIsReplying, setReplyToMessage } = useChatContext();

    const renderLeftActions = useCallback(
      (progress: any) => {
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 0],
        });

        return (
          <Animated.View
            style={[styles.replyContainer, { transform: [{ translateX }] }]}
          >
            <MaterialIcons name="reply" size={24} color="#fff" />
          </Animated.View>
        );
      },
      [currentMessage]
    );

    const handleSwipe = (currentMessage: IMessage) => {
      if (swipeableRef.current) {
        swipeableRef.current.close();
      }
      setIsReplying(true);
      setReplyToMessage(currentMessage);
    };

    let ticks = null;
    if (currentMessage.user._id === user?.userId) {
      // Only for user's messages
      if (currentMessage.read) {
        ticks = (
          <Text
            style={{
              fontSize: 12,
              color: selectedTheme.secondary,
              paddingRight: 5,
            }}
          >
            ✓✓
          </Text>
        );
      } else if (currentMessage.delivered) {
        ticks = (
          <Text
            style={{
              fontSize: 12,
              color: selectedTheme.secondary,
              paddingRight: 5,
            }}
          >
            ✓
          </Text>
        );
      }
    }

    return (
      <GestureHandlerRootView>
        <Swipeable
          ref={swipeableRef}
          renderLeftActions={renderLeftActions}
          onSwipeableOpen={() => {
            handleSwipe(currentMessage) as any;
          }}
          rightThreshold={40}
          leftThreshold={40}
          friction={1}
          overshootLeft={false}
          useNativeAnimations={true}
        >
          <Bubble
            {...props}
            renderTicks={() => ticks}
            wrapperStyle={{
              left: {
                backgroundColor: selectedTheme.message.user.background,
                marginLeft: 5,
                marginBottom: 3,
                maxWidth: "65%",
              },
              right: {
                backgroundColor: selectedTheme.message.other.background,
                marginRight: 5,
                marginBottom: 3,
                maxWidth: "65%",
              },
            }}
          />
        </Swipeable>
      </GestureHandlerRootView>
    );
  }
);

export default RenderBubble;

const styles = StyleSheet.create({
  replyContainer: {
    width: 60,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
