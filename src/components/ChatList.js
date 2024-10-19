import React from 'react';
import { FlatList, View } from 'react-native';
import ChatObject from './ChatObject';

const ChatList = ({ users, navigation}) => {

  return (
    <FlatList
      data={users}
      renderItem={({ item }) => <ChatObject users={item} />}
      keyExtractor={(item, index) => index.toString()}
      onPress={() => navigation.navigate('ChatScreen')}
      ItemSeparatorComponent={<View style={{height:15}}></View>}
    />
  );
};

export default ChatList;
