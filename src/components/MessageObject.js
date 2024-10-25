import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import React, {useRef} from 'react';
import {formatTimeWithoutSeconds} from '../../commons';
import {useAuth} from '../AuthContext';
import {GestureHandlerRootView, Swipeable} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MessageObject = ({
  item,
  onReply,
  onReplyPress,
  scrollToMessage,
  isReferenceMessage = false,
}) => {
  const {user} = useAuth();
  const swipeableRef = useRef(null);
  const isUserMessage = item.senderId === user?.userId;
  const messageStyle = isUserMessage ? styles.userMessage : styles.otherMessage;

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-50, 0],
      outputRange: [0, 50],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.replyAction,
          {
            transform: [{translateX: trans}],
          },
        ]}>
        <Icon name="reply" size={24} color="#000" />
      </Animated.View>
    );
  };

  const renderLeftActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50],
      outputRange: [-50, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[styles.replyAction, {transform: [{translateX: trans}]}]}>
        <Icon name="reply" size={24} color="#000" />
      </Animated.View>
    );
  };

  const handleReply = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }
    onReply(item);
  };

  const handleReplyReference = () => {
    if (item.replyTo) {
      scrollToMessage(item.replyTo.id);
      onReplyPress(item.replyTo.id);
    }
  };

  return (
    <GestureHandlerRootView>
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={isUserMessage ? null : renderLeftActions} 
        renderRightActions={isUserMessage ? renderRightActions : null}
        onSwipeableOpen={handleReply}
        leftThreshold={50} 
        rightThreshold={50} 
        overshootLeft={false}
        overshootRight={false}
        friction={0.5} 
        enabled={!isReferenceMessage}>
        <View
          style={[
            isUserMessage
              ? styles.userMessageContainer
              : styles.otherMessageContainer,
            isReferenceMessage && styles.referenceMessage,
          ]}>
          {item.replyTo && (
            <TouchableOpacity
              onPress={handleReplyReference}
              style={styles.replyToContainer}>
              <View
                style={[
                  styles.replyIndicator,
                  {
                    backgroundColor:
                      item.replyTo.senderId === user?.userId
                        ? 'lightgrey'
                        : '#c8ecee',
                  },
                ]}>
                <Text style={styles.replyToName}>
                  {item.replyTo.senderId === user?.userId
                    ? 'You'
                    : item.replyTo.senderName}
                </Text>
                <Text numberOfLines={1} style={styles.replyToContent}>
                  {item.replyTo.content}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          <Text style={messageStyle}>{item.content}</Text>
          <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <Text style={isUserMessage ? styles.userTime : styles.otherTime}>
              {formatTimeWithoutSeconds(item.createdAt)}
            </Text>
            {item.read && isUserMessage && (
              <Text style={{fontSize: 10, color: 'grey', marginLeft: 5}}>
                read
              </Text>
            )}
          </View>
        </View>
      </Swipeable>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  userMessageContainer: {
    backgroundColor: 'lightgrey',
    borderRadius: 7,
    marginVertical: 5,
    alignSelf: 'flex-end',
    maxWidth: '80%',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  otherMessageContainer: {
    backgroundColor: '#c8ecee',
    borderRadius: 7,
    marginVertical: 5,
    alignSelf: 'flex-start',
    maxWidth: '80%',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  userMessage: {
    fontSize: 16,
    color: '#000',
  },
  otherMessage: {
    fontSize: 16,
    color: '#000',
  },
  userTime: {
    fontSize: 10,
    color: 'grey',
    alignSelf: 'flex-start',
  },
  otherTime: {
    fontSize: 10,
    color: 'grey',
    alignSelf: 'flex-end',
  },
  replyAction: {
    // backgroundColor: '#075e54',
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    borderRadius: 7,
    marginVertical: 5,
  },
  replyToContainer: {
    marginBottom: 5,
  },
  replyIndicator: {
    borderRadius: 5,
    padding: 5,
    opacity: 0.8,
  },
  replyToName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#075e54',
  },
  replyToContent: {
    fontSize: 12,
    color: '#666',
  },
  referenceMessage: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: '#075e54',
  },
});

export default MessageObject;
