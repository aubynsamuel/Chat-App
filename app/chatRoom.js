import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  GiftedChat,
  InputToolbar,
  Bubble,
  Send,
  MessageText,
  Composer,
} from "react-native-gifted-chat";
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
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import {
  db,
  useAuth,
  getCurrentTime,
  getRoomId,
  useTheme,
  fetchCachedMessages,
  cacheMessages,
  createRoomIfItDoesNotExist,
  getStyles,
} from "../imports";
import TopHeaderBar from "../components/HeaderBar_ChatScreen";
import EmptyChatRoomList from "../components/EmptyChatRoomList";
import ChatRoomBackground from "../components/ChatRoomBackground";
import { sendNotification } from "../services/NotificationActions";

const ChatScreen = () => {
  const { userId, username } = useLocalSearchParams();
  const { user } = useAuth();
  const { selectedTheme, chatBackgroundPic } = useTheme();
  const [messages, setMessages] = useState([]);
  const [otherUserToken, setOtherUserToken] = useState("");
  const roomId = getRoomId(user?.userId, userId);
  const styles = getStyles(selectedTheme);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editMessage, setEditMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [profileUrl, setProfileUrl] = useState();

  useEffect(() => {
    fetchOtherUsersProfileUrl();
    fetchOtherUserToken();
    const unsubscribe = initializeChat();
    return () => {
      if (unsubscribe) unsubscribe;
    };
  }, [roomId, user, userId]);

  useEffect(() => {
    markMessagesAsRead();
  }, [roomId, user.userId, messages]);

  const initializeChat = async () => {
    const roomRef = doc(db, "rooms", roomId);
    const messagesRef = collection(roomRef, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

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

  const fetchOtherUsersProfileUrl = async () => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfileUrl(userData.profileUrl);
      } else {
        console.log("User document does not exist.");
      }
    } catch (error) {
      console.error("Error fetching profile URL:", error);
    }
  };

  const fetchOtherUserToken = async () => {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setOtherUserToken(userDoc.data().deviceToken);
      }
    } catch (error) {
      console.error("Error fetching other user's token:", error);
    }
  };

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

              setMessages((prevMessages) =>
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

  const handleMessagePress = useCallback(
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
          keyboardShouldPersistTaps="always"
          alwaysShowSend={true}
          renderComposer={(props) =>
            isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  value={editText}
                  onChangeText={setEditText}
                  style={styles.editInput}
                  autoFocus
                  multiline={true}
                  numberOfLines={5}
                />
                <TouchableOpacity
                  onPress={handleEditSave}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  style={styles.editButton}
                >
                  <MaterialIcons
                    name="close"
                    size={20}
                    style={styles.editButtonText}
                  />
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
            <View>
              {isReplying && (
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    justifyContent: "space-between",
                    backgroundColor: selectedTheme.primary,
                    alignItems: "center",
                    paddingHorizontal: 15,
                    paddingTop: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                    }}
                  >
                    <TouchableOpacity style={{ alignSelf: "center" }}>
                      <MaterialIcons name="reply" size={28} color="black" />
                    </TouchableOpacity>
                    <Text
                      style={{
                        fontSize: 35,
                        alignSelf: "flex-start",
                        bottom: 5,
                      }}
                    >
                      |
                    </Text>
                    <View style={{ height: 50, gap: 3 }}>
                      <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                        Replying To Name
                      </Text>
                      <Text>Replying Message</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={{ alignSelf: "center" }}
                    onPress={() => setIsReplying(false)}
                  >
                    <MaterialIcons
                      name="close"
                      size={24}
                      color="black"
                      style={{
                        marginRight: 5,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              )}

              <View
                style={{
                  backgroundColor: isReplying ? selectedTheme.primary : null,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  // paddingTop: -5,
                  gap: 5,
                }}
              >
                <InputToolbar
                  {...props}
                  containerStyle={{
                    // backgroundColor: selectedTheme.background,
                    width: isEditing || isReplying ? "96%" : "85%",
                    marginBottom: 10,
                    alignSelf: "flex-start",
                    borderRadius: 30,
                    height: 40,
                    marginLeft: 5,
                  }}
                />
                {!isEditing && !isReplying && (
                  <MaterialIcons
                    name="mic"
                    size={30}
                    color="black"
                    style={{
                      backgroundColor: "white",
                      borderRadius: 40,
                      padding: 5,
                      alignSelf: "flex-start",
                      marginRight: 5,
                    }}
                  />
                )}
              </View>
            </View>
          )}
          renderActions={(props) => (
            <View
              {...props}
              style={{
                flexDirection: "row",
              }}
            >
              <TouchableOpacity
                // onPress={() => handleDelete(props.currentMessage)}
                style={{ bottom: 10 }}
              >
                <MaterialIcons
                  name="attachment"
                  color={selectedTheme.text.primary}
                  size={27}
                  style={{ transform: [{ rotate: "120deg" }], marginLeft: 7 }}
                />
              </TouchableOpacity>
            </View>
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
          onPress={handleMessagePress}
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
              {/* <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  marginRight: 15,
                }}
              >
                <MaterialIcons
                  name="camera-alt"
                  color={selectedTheme.text.primary}
                  size={25}
                /> */}
              <MaterialIcons
                name="send"
                color={selectedTheme.text.primary}
                size={25}
                style={{ transform: [{ rotate: "-40deg" }], bottom: 4 }}
              />
              {/* </View> */}
            </Send>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});
export default ChatScreen;
