import { View, Text, TouchableOpacity, Image } from "react-native";
import { memo, useEffect, useState } from "react";
import getStyles from "../styles/Component_Styles";
import { formatTimeWithoutSeconds, getRoomId, useAuth } from "../imports";
import { RoomData } from "../AppLayout/(main)/(homeStack)/home";
import { Theme } from "../context/ThemeContext";
import { useUnreadChatsStore } from "@/context/UnreadChatStore";
import { useNavigation } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";
import useNetworkStore from "@/context/NetworkStore";
import { activeTouchableOpacity } from "@/Functions/Constants";
import { RootStackParamList } from "@/Functions/navigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type ChatNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "chatRoom"
>;

const ChatObject = memo(({ room, theme }: { room: RoomData; theme: Theme }) => {
  const navigation = useNavigation<ChatNavigationProp>();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const styles = getStyles(theme);
  const roomId = getRoomId(user?.userId, room.otherParticipant.userId);
  const { addToUnread, removeFromUnread } = useUnreadChatsStore();
  const isInternetReachable = useNetworkStore(
    (state) => state.details?.isInternetReachable
  );

  useEffect(() => {
    console.log(
      "Subscribing to rooms from chat object",
      room.otherParticipant.username
    );
    const docRef = firestore().collection("rooms").doc(roomId);
    const messagesRef = docRef.collection("messages");

    const q = messagesRef
      .where("senderId", "==", room.otherParticipant.userId)
      .where("read", "==", false);

    const unsubscribe = q.onSnapshot((snapshot) => {
      setUnreadCount(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, [user?.userId, room.otherParticipant.userId, isInternetReachable]);

  useEffect(() => {
    if (unreadCount > 0) {
      addToUnread(roomId);
    } else {
      removeFromUnread(roomId);
    }
  }, [unreadCount]);

  const handlePress = () => {
    navigation.navigate("chatRoom", {
      otherUsersUserId: room.otherParticipant.userId,
      otherUsersUsername: room.otherParticipant.username,
      profileUrl: room.otherParticipant.profileUrl,
      otherUsersToken: room.otherParticipant.otherUsersDeviceToken,
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={activeTouchableOpacity}
      style={styles.chatBox}
      onPress={handlePress}
    >
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
