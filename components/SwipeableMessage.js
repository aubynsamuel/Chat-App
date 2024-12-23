import React, { useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { IMessage } from 'react-native-gifted-chat';

const SwipeableMessage = ({ message, currentMessage, renderMessageOriginal, onSwipeToReply, position }) => {
  const swipeableRef = useRef(null);

  const renderRightActions = (progress) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
    });

    return (
      <Animated.View 
        style={[
          styles.replyContainer,
          { transform: [{ translateX }] }
        ]}
      >
        <MaterialIcons name="reply" size={24} color="#fff" />
      </Animated.View>
    );
  };

  const renderLeftActions = (progress) => {
    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0],
    });

    return (
      <Animated.View 
        style={[
          styles.replyContainer,
          { transform: [{ translateX }] }
        ]}
      >
        <MaterialIcons name="reply" size={24} color="#fff" />
      </Animated.View>
    );
  };

  const handleSwipe = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }
    onSwipeToReply(currentMessage);
  };

  return (
    <GestureHandlerRootView>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={position === 'right' ? renderRightActions : undefined}
        renderLeftActions={position === 'left' ? renderLeftActions : undefined}
        onSwipeableOpen={handleSwipe}
        rightThreshold={40}
        leftThreshold={40}
        friction={2}
        overshootLeft={false}
        overshootRight={false}
      >
        <View>{renderMessageOriginal(message)}</View>
      </Swipeable>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  replyContainer: {
    width: 60,
    height: '100%',
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default SwipeableMessage;