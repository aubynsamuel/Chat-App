import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
import { formatTimeWithoutSeconds , getRoomId} from "../Functions/Commons";
import { memo, useEffect, useState } from "react";
import { db } from "../../env/firebaseConfig";
import { collection, query, onSnapshot, doc, where } from "firebase/firestore";
import getStyles from "./Component_Styles";

const ChatObject = memo(({ room, theme }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const styles = getStyles(theme);

  useEffect(() => {
    const roomId = getRoomId(user?.userId, room.otherParticipant.userId);
    const docRef = doc(db, "rooms", roomId);
    const messagesRef = collection(docRef, "messages");

    const q = query(
      messagesRef,
      where("senderId", "==", room.otherParticipant.userId),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
      console.log(unreadCount);
    });

    return unsubscribe;
  }, [user?.userId, room.otherParticipant.userId]);

  const handlePress = () => {
    navigation.navigate("ChatScreen", {
      userId: room.otherParticipant.userId,
      username: room.otherParticipant.username,
      profileUrl: room.otherParticipant.profileUrl,
      deviceToken: room.otherParticipant.deviceToken,
    });
  };

  return (
    <TouchableOpacity style={styles.chatBox} onPress={handlePress}>
      <View
        style={[styles.chatBox, { width: "82%", justifyContent: "flex-start" }]}
      >
        {/* Avatar */}
        <View>
          <TouchableOpacity>
            {imageFailed ||
            room?.otherParticipant.profileUrl == "" ||
            room?.otherParticipant.profileUrl == null ? (
              <Image
                style={{ width: 50, height: 50, borderRadius: 30 }}
                source={require("../../myAssets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp")}
                transition={500}
              />
            ) : (
              <Image
                style={{ width: 50, height: 50, borderRadius: 30 }}
                source={{ uri: room?.otherParticipant.profileUrl }}
                transition={500}
                onError={() => setImageFailed(true)}
              />
            )}
          </TouchableOpacity>
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
