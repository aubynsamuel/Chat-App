import React, { memo, useEffect, useState, useMemo } from "react";
import {
  FlatList,
  View,
  RefreshControl,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import ChatObject from "./ChatObject";
import getStyles from "../styles/Component_Styles";
import { useAuth } from "../context/AuthContext";

const ChatList = memo(({ rooms, isLoading, onRefresh, theme }) => {
  const styles = getStyles(theme);
  const { unreadChats } = useAuth();
  const [roomData, setRooms] = useState(rooms);
  const [filter, setFilter] = useState("all"); // Track active filter
  const [emptyListMessage, setEmptyListMessage] =
    useState("No chats available");

  useEffect(() => {
    // Update the displayed list based on the filter
    if (filter === "unread") {
      const unreadChatList = rooms.filter((room) =>
        unreadChats.includes(room.roomId)
      );
      setRooms(unreadChatList);
      setEmptyListMessage(
        unreadChatList.length > 0 ? null : "No unread messages"
      );
    } else {
      setRooms(rooms);
      setEmptyListMessage("No chats available");
    }
  }, [filter, rooms, unreadChats]);

  const multiplesOf35 = useMemo(() => {
    if (rooms.length < 10) return [];
    return rooms.map((_, index) => index * 65 + 35);
  }, [rooms]);

  const renderEmptyComponent = () => (
    <View style={styles.clEmptyContainer}>
      <Text style={styles.clEmptyText}>
        {isLoading ? "Loading chats..." : emptyListMessage}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={roomData}
      ListHeaderComponent={() => (
        <View style={headerStyles.container}>
          <TouchableOpacity onPress={() => setFilter("all")}>
            <Text style={headerStyles.text}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilter("unread")}>
            <Text style={headerStyles.text}>Unread</Text>
          </TouchableOpacity>
        </View>
      )}
      snapToOffsets={multiplesOf35}
      decelerationRate="fast"
      contentOffset={{ y: 35 }}
      renderItem={({ item }) => <ChatObject room={item} theme={theme} />}
      keyExtractor={(item, index) => item.roomId || index.toString()}
      ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          colors={[theme.primary]}
          tintColor={theme.primary}
        />
      }
      ListEmptyComponent={renderEmptyComponent}
      contentContainerStyle={[
        rooms.length === 0 ? styles.clCenterEmptySet : null,
        { paddingTop: 9, paddingBottom: 10 },
      ]}
    />
  );
});

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 5,
    marginHorizontal: 5,
    paddingBottom: 9,
  },
  text: {
    backgroundColor: "black",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 2,
    fontSize: 13,
    color: "white",
    fontWeight: "500",
  },
});

export default ChatList;
