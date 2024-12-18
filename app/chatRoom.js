import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, Alert, TextInput, TouchableOpacity } from "react-native";
import {
  GiftedChat,
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
  storage,
} from "../imports";
import TopHeaderBar from "../components/HeaderBar_ChatScreen";
import EmptyChatRoomList from "../components/EmptyChatRoomList";
import ChatRoomBackground from "../components/ChatRoomBackground";
import { sendNotification } from "../services/NotificationActions";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import AccessoryBar from "../components/AccessoryBar";
import CustomView from "../components/CustomView";
import RenderMessageImage from "../components/RenderMessageImage";
import Animated, { FadeInRight } from "react-native-reanimated";
import ImageMessageDetails from "../components/ImageMessageDetails";
import InputToolBar from "../components/RenderInputToolBar";
import AudioPlayerComponent from "../components/RenderAudioMessage";

const ChatScreen = () => {
  const { userId, username } = useLocalSearchParams();
  const {
    user,
    setImageModalVisibility,
    imageModalVisibility,
    profileUrl,
    setLoadingIndicator,
  } = useAuth();
  const { selectedTheme, chatBackgroundPic } = useTheme();
  const [messages, setMessages] = useState([]);
  const [otherUserToken, setOtherUserToken] = useState("");
  const roomId = getRoomId(user?.userId, userId);
  const styles = getStyles(selectedTheme);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editMessage, setEditMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [showActions, setShowActionButtons] = useState(true);
  const [imageUrl, setImageUrl] = useState();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
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
          image: data.type === "image" ? data.image : null,
          audio: data.type === "audio" ? data.audio : null,
          createdAt: data.createdAt.toDate(),
          user: {
            _id: data.senderId,
            name: data.senderName,
          },
          replyTo: data.replyTo,
          read: data.read || false,
          type: data.type || "text",
          delivered: data.delivered || false,
          location: data.location
            ? {
                latitude: data.location.latitude,
                longitude: data.location.longitude,
              }
            : null,
        };
      });
      setMessages(fetchedMessages);
      cacheMessages(roomId, fetchedMessages);
    });

    return unsubscribe;
  };

  const openPicker = async (SelectType) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [SelectType],
      allowsEditing: true,
      quality: 1,
    });

    setImageUrl(result.assets[0].uri);
    setImageModalVisibility(true);
  };

  const uploadMediaFile = async (media, username) => {
    let downloadURL;
    try {
      if (media) {
        const response = await fetch(media.uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `chatMedia/${username}.jpg`);
        await uploadBytes(storageRef, blob);
        downloadURL = await getDownloadURL(storageRef);
      }
      return downloadURL;
    } catch (error) {
      console.error("Error uploading media:", error);
      return null;
    }
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

      // Prepare message for Firestore
      const messageData = {
        content: newMessage.text || "",
        senderId: user.userId,
        senderName: user.username,
        createdAt: getCurrentTime(),
        replyTo: newMessage.replyTo || null,
        read: false,
        delivered: true,
        type: newMessage.type || "text",
        image: newMessage.image || null,
        audio: newMessage.audio || null,
        location: newMessage.location
          ? {
              latitude: newMessage.location.latitude,
              longitude: newMessage.location.longitude,
            }
          : null,
      };

      // Update local messages state
      setMessages((prevMessages) =>
        GiftedChat.append(prevMessages, newMessages)
      );

      try {
        const roomRef = doc(db, "rooms", roomId);
        const messagesRef = collection(roomRef, "messages");

        // Add message to Firestore
        await setDoc(doc(messagesRef), messageData);

        // Update room last message
        await setDoc(
          roomRef,
          {
            lastMessage: messageBody(newMessage),
            lastMessageTimestamp: getCurrentTime(),
            lastMessageSenderId: user.userId,
          },
          { merge: true }
        );

        // Send notification if other user token exists
        if (otherUserToken) {
          sendNotification(
            otherUserToken,
            `${user.username}`,
            messageBody(newMessage),
            roomId
          );
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [roomId, user, otherUserToken]
  );

  const messageBody = (newMessage) => {
    if (newMessage.type === "image") {
      return "📷 Sent an image";
    } else if (newMessage.type === "audio") {
      return "🔉 Sent an audio";
    } else if (newMessage.type === "location") {
      return "🌍 Shared a location";
    } else {
      return newMessage.text;
    }
  };

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
                setShowActionButtons(false);
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
            marginLeft: 5,
            marginBottom: 3,
          },
          right: {
            backgroundColor: selectedTheme.message.user.background,
            marginRight: 5,
            marginBottom: 3,
          },
        }}
      />
    );
  };

  const renderCustomView = useCallback((props) => {
    return <CustomView {...props} />;
  }, []);

  const renderMessageAudio = (props) => {
    const { currentMessage } = props;

    // Only render if it's an audio message
    if (currentMessage.type === "audio" && currentMessage.audio) {
      return (
        <AudioPlayerComponent
          currentMessage={currentMessage}
          selectedTheme={selectedTheme}
        />
      );
    }

    return null;
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
          onInputTextChanged={(text) => {
            if (text.length > 0) {
              setShowActionButtons(false);
            } else {
              setShowActionButtons(true);
            }
          }}
          messagesContainerStyle={styles.crMessages}
          keyboardShouldPersistTaps="always"
          alwaysShowSend={false}
          renderCustomView={renderCustomView}
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
                  onPress={() => {
                    setIsEditing(false);
                    setShowActionButtons(true);
                    handleEditSave();
                  }}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditing(false);
                    setShowActionButtons(true);
                  }}
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
                textInputStyle={{
                  color: selectedTheme.text.primary,
                  width:
                    isEditing || isReplying || !showActions ? "96%" : "85%",
                  justifyContent: "center",
                  borderRadius: 10,
                  marginLeft: showActions ? 25 : 5,
                }}
              />
            )
          }
          messages={messages}
          onSend={(newMessages) => {
            handleSend(newMessages);
            setShowActionButtons(true);
          }}
          user={{
            _id: user.userId,
            name: user.username,
          }}
          renderMessageText={(props) => {
            return (
              <MessageText
                {...props}
                textStyle={{
                  left: { color: selectedTheme.message.other.text },
                  right: { color: selectedTheme.message.user.text },
                }}
              />
            );
          }}
          renderInputToolbar={(props) => (
            <InputToolBar
              isReplying={isReplying}
              setIsReplying={setIsReplying}
              selectedTheme={selectedTheme}
              showActions={showActions}
              isEditing={isEditing}
              props={props}
              handleSend={handleSend}
              user={user}
            />
          )}
          renderMessageAudio={renderMessageAudio}
          timeTextStyle={{
            left: { color: selectedTheme.message.other.time },
            right: { color: selectedTheme.message.user.time },
          }}
          renderBubble={renderBubble}
          renderActions={() =>
            showActions ? (
              <AccessoryBar
                recipient={username}
                onSend={handleSend}
                openPicker={openPicker}
                user={user}
                uploadMediaFile={uploadMediaFile}
                setLoadingIndicator={setLoadingIndicator}
              />
            ) : !isEditing ? (
              <Animated.View
                entering={FadeInRight.duration(100)}
                style={{ alignSelf: "center" }}
              >
                <MaterialIcons
                  name="arrow-back-ios"
                  size={25}
                  color="black"
                  onPress={() => setShowActionButtons(true)}
                  style={{
                    marginLeft: 8,
                    transform: [{ rotate: "180deg" }],
                  }}
                />
              </Animated.View>
            ) : null
          }
          renderChatEmpty={() => (
            <View style={{ transform: [{ rotate: "180deg" }], bottom: -300 }}>
              <EmptyChatRoomList />
            </View>
          )}
          scrollToBottom={true}
          scrollToBottomComponent={() => (
            <View>
              {unreadCount > 0 ? (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "red",
                    bottom: 13,
                    textAlign: "center",
                    zIndex: 2,
                    backgroundColor: selectedTheme.primary,
                    borderRadius: 50,
                    marginTop: 10,
                    width: 40,
                    height: 25,
                  }}
                >
                  {unreadCount}
                </Text>
              ) : null}
              <MaterialIcons
                style={[
                  styles.crScrollToEndButton,
                  { bottom: unreadCount > 0 ? 10 : null },
                ]}
                name="double-arrow"
                color={"#000"}
                size={30}
              />
            </View>
          )}
          renderMessageImage={(props) => (
            <RenderMessageImage
              imageStyle={{
                borderTopLeftRadius:
                  props.currentMessage.user._id === user.userId ? 13 : 0,
                borderTopRightRadius:
                  props.currentMessage.user._id === user.userId ? 0 : 13,
              }}
              {...props}
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
              <MaterialIcons
                name="send"
                color={selectedTheme.text.primary}
                size={25}
                style={{ transform: [{ rotate: "-40deg" }], bottom: 4 }}
              />
            </Send>
          )}
        />
        {imageModalVisibility && (
          <ImageMessageDetails
            handleSend={handleSend}
            image={imageUrl}
            uploadMediaFile={uploadMediaFile}
          />
        )}
      </View>
    </View>
  );
};

export default ChatScreen;
