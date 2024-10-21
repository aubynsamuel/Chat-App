import React from 'react';
import { FlatList, View, ActivityIndicator, RefreshControl, Text, StyleSheet } from 'react-native';
import ChatObject from './chatObject';

const ChatList = ({ rooms, isLoading, onRefresh }) => {
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {isLoading ? 'Loading chats...' : 'No chats available'}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={rooms}
      renderItem={({ item }) => <ChatObject room={item} />}
      keyExtractor={(item, index) => item.roomId || index.toString()}
      // onPress={() => navigation.navigate('ChatScreen')}
      ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          colors={['#5385F7']} // Match your app's color scheme
          tintColor="#5385F7"
        />
      }
      ListEmptyComponent={renderEmptyComponent}
      contentContainerStyle={rooms.length === 0 ? styles.centerEmptySet : null}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  centerEmptySet: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default ChatList;