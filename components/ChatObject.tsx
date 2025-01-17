import { View, Text, TouchableOpacity, Image } from "react-native";
import { memo, useEffect, useState } from "react";
import { collection, query, onSnapshot, doc, where } from "firebase/firestore";
import { router } from "expo-router";
import getStyles from "../styles/Component_Styles";
import { formatTimeWithoutSeconds, getRoomId, useAuth, db } from "../imports";
import { RoomData } from "../app/(main)/(homeStack)/home";
import { Theme } from "../context/ThemeContext";
import { useProfileURlStore } from "@/context/ProfileUrlStore";
import { useUnreadChatsStore } from "@/context/UnreadChatStore";
const ChatObject = memo(({ room, theme }: { room: RoomData; theme: Theme }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const styles = getStyles(theme);
  const roomId = getRoomId(user?.userId, room.otherParticipant.userId);
  const setProfileUrlLink = useProfileURlStore(
    (state) => state.setProfileUrlLink
  );
  const { addToUnread, removeFromUnread } = useUnreadChatsStore();

  useEffect(() => {
    const docRef = doc(db, "rooms", roomId);
    const messagesRef = collection(docRef, "messages");

    const q = query(
      messagesRef,
      where("senderId", "==", room.otherParticipant.userId),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    });

    return unsubscribe;
  }, [user?.userId, room.otherParticipant.userId]);

  useEffect(() => {
    if (unreadCount > 0) {
      addToUnread(roomId);
    } else {
      removeFromUnread(roomId);
    }
  }, [unreadCount]);

  const handlePress = () => {
    setProfileUrlLink(room.otherParticipant.profileUrl);
    // console.log("Navigating with profileUrl:", room.otherParticipant.profileUrl);
    router.push({
      pathname: "/chatRoom",
      params: {
        userId: room.otherParticipant.userId,
        username: room.otherParticipant.username,
        profileUrl: room.otherParticipant.profileUrl,
        otherUserToken: room.otherParticipant.otherUsersDeviceToken,
      },
    });
  };

  return (
    <TouchableOpacity style={styles.chatBox} onPress={handlePress}>
      <View
        style={[styles.chatBox, { width: "82%", justifyContent: "flex-start" }]}
      >
        {/* Avatar */}

        <View>
          {imageFailed ||
          room?.otherParticipant.profileUrl == "" ||
          room?.otherParticipant.profileUrl == null ? (
            <Image
              style={{ width: 50, height: 50, borderRadius: 30 }}
              source={require("../myAssets/Images/profile-picture-placeholder.webp")}
            />
          ) : (
            <Image
              style={{ width: 50, height: 50, borderRadius: 30 }}
              source={{ uri: room?.otherParticipant.profileUrl }}
              onError={() => {
                setImageFailed(true);
              }}
            />
          )}
        </View>

        <View style={{ marginLeft: 8, width: "80%" }}>
          {/* Username */}
          <Text numberOfLines={1} style={styles.name}>
            {room?.otherParticipant.username}
          </Text>

          {/* Last message */}
          <Text numberOfLines={1} style={styles.lastMessage}>
            {room?.lastMessageSenderId !== user?.userId
              ? typeof room?.lastMessage === "string"
                ? room?.lastMessage
                : "Unsupported message format" // fallback if not a string
              : `You: ${
                  typeof room?.lastMessage === "string"
                    ? room?.lastMessage
                    : "Unsupported message format"
                }`}
          </Text>
        </View>
      </View>

      <View>
        {/* Time of last message */}
        <Text style={styles.time}>
          {room?.lastMessageTimestamp !== undefined
            ? formatTimeWithoutSeconds(room?.lastMessageTimestamp)
            : ""}
        </Text>
        {/* Number of unread messages */}
        {unreadCount > 0 && <Text style={styles.unread}>{unreadCount}</Text>}
      </View>
    </TouchableOpacity>
  );
});

export default ChatObject;
