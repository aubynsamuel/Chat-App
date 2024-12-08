import React, {  } from "react";
import {
  Text,
} from "react-native";
import {
  Bubble,
} from "react-native-gifted-chat";

export default renderBubble = (props) => {
    const { currentMessage } = props;

    let ticks = null;
    if (currentMessage.user._id === user.userId) {
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
      <Bubble
        {...props}
        renderTicks={() => ticks}
        wrapperStyle={{
          left: {
            backgroundColor: selectedTheme.message.other.background,
          },
          right: {
            backgroundColor: selectedTheme.message.user.background,
          },
        }}
      />
    );
  };