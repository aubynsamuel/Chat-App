import { StyleSheet, Text, Animated, View } from "react-native";
import React, { memo, useCallback, useRef } from "react";
import { Bubble, BubbleProps } from "react-native-gifted-chat";
import { IMessage } from "@/Functions/types";
import { darkTheme, useAuth } from "@/imports";
import { useTheme } from "@/imports";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { MaterialIcons } from "@expo/vector-icons";
import { useHighlightStore } from "@/context/MessageHighlightStore";

interface RenderBubbleProps {
  props: Readonly<BubbleProps<IMessage>>;
  setIsReplying: React.Dispatch<React.SetStateAction<boolean>>;
  setReplyToMessage: React.Dispatch<React.SetStateAction<IMessage | null>>;
}

const selectIsHighlighted = (state: any) => (messageId: string | number) =>
  state.isMessageHighlighted(messageId);

const RenderBubble: React.FC<RenderBubbleProps> = memo(
  ({ props, setIsReplying, setReplyToMessage }) => {
    const { user } = useAuth();
    const { currentMessage } = props;
    const { selectedTheme } = useTheme();
    const swipeableRef = useRef<any>(null);

    // console.log("Render Bubble for " + currentMessage._id);

    const renderLeftActions = useCallback(
      (progress: any) => {
        const translateX =
          currentMessage.user.name === user?.username
            ? progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 50],
              })
            : progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              });

        return (
          <Animated.View
            style={[styles.replyContainer, { transform: [{ translateX }] }]}
          >
            <MaterialIcons
              name="reply"
              size={24}
              color={
                selectedTheme === darkTheme ? "white" : selectedTheme.background
              }
            />
          </Animated.View>
        );
      },
      [user, selectedTheme, currentMessage]
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
              color:
                selectedTheme === darkTheme
                  ? selectedTheme.surface
                  : selectedTheme.secondary,
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
              color:
                selectedTheme === darkTheme
                  ? selectedTheme.surface
                  : selectedTheme.secondary,
              paddingRight: 5,
            }}
          >
            ✓
          </Text>
        );
      }
    }

    // const shouldHighlight = currentMessage._id === highlightedMessageId;
    const isHighlighted = useHighlightStore(
      useCallback(
        (state) => selectIsHighlighted(state)(currentMessage._id),
        [currentMessage._id]
      )
    );

    return (
      <View
        style={
          !isHighlighted
            ? ({
                maxWidth: "85%",
              } as any)
            : ({
                backgroundColor: selectedTheme.secondary,
                maxWidth: "85%",
                borderRadius: 15,
              } as any)
        }
      >
        <Swipeable
          ref={swipeableRef}
          renderLeftActions={renderLeftActions}
          onSwipeableOpen={() => {
            handleSwipe(currentMessage) as any;
          }}
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
                backgroundColor: selectedTheme.message.other.background,
                marginLeft: 5,
                marginBottom: 3,
                maxWidth: "80%",
              },
              right: {
                backgroundColor: selectedTheme.message.user.background,
                marginRight: 5,
                marginBottom: 3,
                maxWidth: "80%",
              },
            }}
          />
        </Swipeable>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.props.currentMessage._id ===
        nextProps.props.currentMessage._id &&
      prevProps.props.currentMessage.text ===
        nextProps.props.currentMessage.text
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
