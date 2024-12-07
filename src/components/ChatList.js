import React, { memo } from "react";
import { FlatList, View, RefreshControl, Text } from "react-native";
import ChatObject from "./ChatObject";
import getStyles from "./Component_Styles";

const ChatList = memo(({ rooms, isLoading, onRefresh, theme }) => {
  const styles = getStyles(theme);
  const renderEmptyComponent = () => (
    <View style={styles.clEmptyContainer}>
      <Text style={styles.clEmptyText}>
        {isLoading ? "Loading chats..." : "No chats available"}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={rooms}
      renderItem={({ item }) => <ChatObject room={item} theme={theme} />}
      keyExtractor={(item, index) => item.roomId || index.toString()}
      ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          colors={["#5385F7"]} // Match your app's color scheme
          tintColor="#5385F7"
        />
      }
      ListEmptyComponent={renderEmptyComponent}
      contentContainerStyle={[
        rooms.length === 0 ? styles.clCenterEmptySet : null,
        { paddingTop: 7 },
      ]}
    />
  );
});

export default ChatList;
