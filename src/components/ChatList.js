import React from 'react';
import { FlatList } from 'react-native';
import ChatObject from './chatObject';

const ChatList = ({ users, navigation}) => {

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => <ChatObject users={item} />}
      keyExtractor={(item, index) => index.toString()}
      onPress={() => navigation.navigate('ChatScreen')}
    />
  );
};

export default ChatList;
