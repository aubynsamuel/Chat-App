import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {formatTimeWithoutSeconds} from '../../commons';
import { useAuth } from '../AuthContext';

const MessageObject = ({item}) => {
  const {user} = useAuth();
  const isUserMessage = item.senderId === user?.userId;
  const messageStyle = isUserMessage ? styles.userMessage : styles.otherMessage;
  return (
    <View
      style={
        isUserMessage
          ? styles.userMessageContainer
          : styles.otherMessageContainer
      }>
      <Text style={messageStyle}>{item.content}</Text>
      <Text style={isUserMessage ? styles.userTime : styles.otherTime}>
        {formatTimeWithoutSeconds(item.createdAt)}
      </Text>
    </View>
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
});

export default MessageObject;
