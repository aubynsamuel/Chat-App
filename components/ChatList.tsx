import React, { memo, useEffect, useState } from "react";
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
import { Theme } from "../context/ThemeContext";
import { useUnreadChatsStore } from "@/context/UnreadChatStore";
import { darkTheme } from "@/imports";
import { activeTouchableOpacity } from "@/Functions/Constants";

const ChatList = memo(
  ({
    rooms,
    isLoading,
    onRefresh,
    theme,
  }: {
    rooms: any[];
    isLoading: boolean;
    onRefresh: () => void;
    theme: Theme;
  }) => {
    const styles = getStyles(theme);
    const [roomData, setRooms] = useState(rooms);
    const [filter, setFilter] = useState("all");
    const [emptyListMessage, setEmptyListMessage] = useState<string | null>(
      "No chats available"
    );
    const unreadChats = useUnreadChatsStore((state) => state.unreadChats);

    const chatListFilterContainer = (filterValue: string) => {
      return {
        backgroundColor:
          filter === filterValue
            ? theme === darkTheme
              ? "#ffff"
              : theme.surface
            : theme === darkTheme
            ? "lightgrey"
            : "#0007",
        color: filter === filterValue ? theme.primary : theme.background,
      };
    };

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
            <TouchableOpacity
              activeOpacity={activeTouchableOpacity}
              onPress={() => setFilter("all")}
            >
              <Text style={[headerStyles.text, chatListFilterContainer("all")]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={activeTouchableOpacity}
              onPress={() => setFilter("unread")}
            >
              <Text
                onPress={() => setFilter("unread")}
                style={[headerStyles.text, chatListFilterContainer("unread")]}
              >
                Unread
              </Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item }) => <ChatObject room={item} theme={theme} />}
        keyExtractor={(item, index) => item.roomId || index.toString()}
        ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={[theme.secondary]}
            tintColor={theme.secondary}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={[
          rooms.length === 0 ? styles.clCenterEmptySet : null,
          { paddingTop: 9, paddingBottom: 10 },
        ]}
      />
    );
  }
);

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 5,
    marginHorizontal: 5,
    paddingBottom: 9,
  },
  text: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    fontSize: 13,
    fontWeight: "500",
  },
});

export default ChatList;
