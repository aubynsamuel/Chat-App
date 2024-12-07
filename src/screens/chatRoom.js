import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import {
  GiftedChat,
  InputToolbar,
  Bubble,
  Send,
  MessageText,
  Composer,
} from "react-native-gifted-chat";
import { useRoute } from "@react-navigation/native";
import { db } from "../../env/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  where,
  getDocs,
  writeBatch,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { getCurrentTime, getRoomId } from "../Functions/Commons";
import { sendNotification } from "../services/ExpoPushNotifications";
import { useTheme } from "../ThemeContext";
import ChatRoomBackground from "../components/ChatRoomBackground";
import TopHeaderBar from "../components/HeaderBar_ChatScreen";
import { StatusBar } from "expo-status-bar";
import { fetchCachedMessages, cacheMessages } from "../Functions/CacheMessages";
import createRoomIfItDoesNotExist from "../Functions/CreateRoomIfItDoesNotExist";
import { MaterialIcons } from "@expo/vector-icons";
import getStyles from "./sreen_Styles";
import * as Clipboard from "expo-clipboard";
import EmptyChatRoomList from "../components/EmptyChatRoomList";
import { useNavigation } from "@react-navigation/native";

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, username, profileUrl } = route.params;
  const { user } = useAuth();
  const { selectedTheme, chatBackgroundPic } = useTheme();
  const [messages, setMessages] = useState([]);
  const [otherUserToken, setOtherUserToken] = useState("");
  const roomId = getRoomId(user?.userId, userId);
  const styles = getStyles(selectedTheme);
  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(null);
  const [editText, setEditText] = useState("");

  const onHardwareBackPress = () => {
    navigation.navigate("Inter");
    // navigation.replace("Home");
    return true;
  };

  useEffect(() => {
    const handleBackPress = BackHandler.addEventListener(
      "hardwareBackPress",
      onHardwareBackPress
    );
    return () => handleBackPress.remove();
  }, []);

  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);
    const messagesRef = collection(roomRef, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    const initializeChat = async () => {
      const cachedMessages = await fetchCachedMessages(roomId);
      if (cachedMessages && cachedMessages.length > 0) {
        setMessages(cachedMessages);
      }

      await createRoomIfItDoesNotExist(roomId, user, userId);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedMessages = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            _id: doc.id,
            text: data.content,
            createdAt: data.createdAt.toDate(),
            user: {
              _id: data.senderId,
              name: data.senderName,
            },
            replyTo: data.replyTo,
            read: data.read || false,
            delivered: data.delivered || false,
          };
        });
        setMessages(fetchedMessages);
        cacheMessages(roomId, fetchedMessages);
      });

      return unsubscribe;
    };

    const unsubscribe = initializeChat();

    return () => {
      if (unsubscribe) unsubscribe;
    };
  }, [roomId, user, userId]);

  useEffect(() => {
    const fetchOtherUserToken = async () => {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setOtherUserToken(userDoc.data().deviceToken);
      }
    };
    fetchOtherUserToken();
  }, [userId]);

  const handleSend = useCallback(
    async (newMessages = []) => {
      const newMessage = newMessages[0];
      setMessages((prevMessages) =>
        GiftedChat.append(prevMessages, newMessages)
      );

      const roomRef = doc(db, "rooms", roomId);
      const messagesRef = collection(roomRef, "messages");

      try {
        const messageData = {
          content: newMessage.text,
          senderId: user.userId,
          senderName: user.username,
          createdAt: getCurrentTime(),
          replyTo: newMessage.replyTo || null,
          read: false,
          delivered: true, 
        };

        await setDoc(doc(messagesRef), messageData);

        await setDoc(
          roomRef,
          {
            lastMessage: newMessage.text,
            lastMessageTimestamp: getCurrentTime(),
            lastMessageSenderId: user.userId,
          },
          { merge: true }
        );

        if (otherUserToken) {
          sendNotification(
            otherUserToken,
            `New message from ${user.username}`,
            newMessage.text,
            roomId
          );
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [roomId, user, otherUserToken]
  );

  const handleDelete = async (message) => {
    Alert.alert(
      "Delete message",
      "This action cannot be undone, do you want to continue?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              const roomRef = doc(db, "rooms", roomId);
              const messageRef = doc(roomRef, "messages", message._id);

              await deleteDoc(messageRef);

              setMessages(
                (prevMessages) =>
                  prevMessages.filter((msg) => msg._id !== message._id)
              );
            } catch (error) {
              console.error("Failed to delete message", error);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const markMessagesAsRead = async () => {
      const roomRef = doc(db, "rooms", roomId);
      const messagesRef = collection(roomRef, "messages");
      const unreadMessagesQuery = query(
        messagesRef,
        where("senderId", "!=", user.userId),
        where("read", "==", false)
      );

      const snapshot = await getDocs(unreadMessagesQuery);
      const batch = writeBatch(db);

      snapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      if (!snapshot.empty) {
        await batch.commit();
      }
    };

    markMessagesAsRead();
  }, [roomId, user.userId, messages]);

  const handlePress = useCallback(
    (context, currentMessage) => {
      if (!currentMessage.text) return;

      const options = [];

      if (currentMessage.user._id === user.userId) {
        options.push("Copy text");
        options.push("Edit Message");
        options.push("Delete message");
      } else {
        options.push("Copy text");
      }
      options.push("Cancel");
      const cancelButtonIndex = options.length - 1;

      context.actionSheet().showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              Clipboard.setStringAsync(currentMessage.text);
              break;
            case 1:
              if (currentMessage.user._id === user.userId) {
                setIsEditing(true);
                setEditMessage(currentMessage);
                setEditText(currentMessage.text);
              }
              break;
            case 2:
              if (currentMessage.user._id === user.userId)
                handleDelete(currentMessage);
              break;
            default:
              break;
          }
        }
      );
    },
    [user.userId, handleDelete, isEditing]
  );

  const handleEditSave = async () => {
    if (!editMessage || !editText) return;

    try {
      const roomRef = doc(db, "rooms", roomId);
      const messageRef = doc(roomRef, "messages", editMessage._id);

      await updateDoc(messageRef, { content: editText });

      setEditText("");
      setEditMessage(null);
      setIsEditing(false);

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === editMessage._id ? { ...msg, text: editText } : msg
        )
      );
    } catch (error) {
      console.error("Failed to edit message:", error);
      Alert.alert("Error", "Failed to edit message. Please try again.");
    }
  };

  const renderBubble = (props) => {
    const { currentMessage } = props;

    let ticks = null;
    if (currentMessage.user._id === user.userId) {
      // Only for user's messages
      if (currentMessage.read) {
        ticks = (
          <Text
            style={{
              fontSize: 12,
              color: selectedTheme.secondary,
              paddingRight: 5,
            }}
          >
            ✓✓
          </Text>
        );
      } else if (currentMessage.delivered) {
        ticks = (
          <Text
            style={{
              fontSize: 12,
              color: selectedTheme.secondary,
              paddingRight: 5,
            }}
          >
            ✓
          </Text>
        ); 
      }
    }

    return (
      <Bubble
        {...props}
        renderTicks={() => ticks}
        wrapperStyle={{
          left: {
            backgroundColor: selectedTheme.message.other.background,
          },
          right: {
            backgroundColor: selectedTheme.message.user.background,
          },
        }}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ChatRoomBackground source={chatBackgroundPic} />
      <StatusBar
        style={`${
          selectedTheme === purpleTheme
            ? "light"
            : selectedTheme.Statusbar.style
        }`}
        backgroundColor={selectedTheme.primary}
        animated={true}
      />
      <View style={{ position: "absolute", zIndex: 5, width: "100%" }}>
        <TopHeaderBar
          theme={selectedTheme}
          title={username}
          profileUrl={profileUrl}
        />
      </View>
      <View style={styles.crContainer}>
        <GiftedChat
          messagesContainerStyle={styles.crMessages}
          keyboardShouldPersistTaps="never"
          minComposerHeight={55}
          alwaysShowSend={true}
          renderComposer={(props) =>
            isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  value={editText}
                  onChangeText={setEditText}
                  style={styles.editInput}
                  autoFocus
                />
                <TouchableOpacity
                  onPress={handleEditSave}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  style={styles.editButton}
                >
                  {/* {" "} */}
                  <Text style={styles.editButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Composer
                {...props}
                textInputStyle={{ color: selectedTheme.text.primary }}
              />
            )
          }
          messages={messages}
          onSend={(newMessages) => handleSend(newMessages)}
          user={{
            _id: user.userId,
            name: user.username,
          }}
          renderMessageText={(props) => (
            <MessageText
              {...props}
              textStyle={{
                left: { color: selectedTheme.message.other.text },
                right: { color: selectedTheme.message.user.text },
              }}
            />
          )}
          timeTextStyle={{
            left: { color: selectedTheme.message.other.time },
            right: { color: selectedTheme.message.user.time },
          }}
          renderBubble={renderBubble} // Use the custom renderBubble function
          renderInputToolbar={(props) => (
            <InputToolbar
              {...props}
              containerStyle={{ backgroundColor: selectedTheme.background }}
            />
          )}
          renderChatEmpty={() => (
            <View style={{ transform: [{ rotate: "180deg" }], bottom: -300 }}>
              <EmptyChatRoomList />
            </View>
          )}
          scrollToBottom={true}
          scrollToBottomComponent={() => (
            <MaterialIcons
              style={styles.crScrollToEndButton}
              name="double-arrow"
              color={"#000"}
              size={30}
            />
          )}
          onPress={handlePress}
          renderAvatar={null}
          renderSend={(props) => (
            <Send
              {...props}
              disabled={!props.text}
              containerStyle={{
                width: 44,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
                marginHorizontal: 4,
              }}
            >
              <MaterialIcons
                name="send"
                color={selectedTheme.text.primary}
                size={25}
              />
            </Send>
          )}
        />
      </View>
    </View>
  );
};

export default ChatScreen;
