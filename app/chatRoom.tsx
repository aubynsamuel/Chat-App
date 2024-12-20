import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  Keyboard,
} from "react-native";
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
import { StatusBar, StatusBarStyle } from "expo-status-bar";
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
import ActionButtons from "../components/ActionButtons";
import CustomView from "../components/CustomView";
import RenderMessageImage from "../components/ImageMessage";
import ImageMessageDetails, {
  MediaFile,
} from "../components/ImageMessageDetails";
import InputToolBar from "../components/InputToolBar";
import AudioPlayerComponent from "../components/AudioMessage";
import { AuthContextType } from "../context/AuthContext";
import { FirebaseMessage } from "../Functions/types";
import { TextStyle } from "react-native";
import { ThemeContextType } from "../context/ThemeContext";
import purpleTheme from "../Themes/Purple";
import { IMessage } from "../Functions/types";
import LoadingIndicator from "../components/LoadingIndicator";
import LottieView from "lottie-react-native";
import Animated, { BounceIn, BounceOut } from "react-native-reanimated";

const ChatScreen = () => {
  const { userId, username } = useLocalSearchParams();
  const { user, setImageModalVisibility, imageModalVisibility, profileUrl } =
    useAuth() as AuthContextType;
  const { selectedTheme, chatBackgroundPic }: ThemeContextType = useTheme();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [otherUserToken, setOtherUserToken] = useState<string>("");
  const roomId: any = getRoomId(user?.userId, userId);
  const styles = getStyles(selectedTheme);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editMessage, setEditMessage] = useState<IMessage | null | undefined>();
  const [editText, setEditText] = useState("");
  const [showActions, setShowActionButtons] = useState(true);
  const [imageUrl, setImageUrl] =
    useState<React.SetStateAction<string | null>>("");
  const [unreadCount, setUnreadCount] = useState(5);
  const [loadingIndicator, setLoadingIndicator] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  // useEffect(() => {
  //   const unreadMessages = messages.filter(
  //     (msg) => msg.read === false && msg.user._id !== user?.userId
  //   );
  //   setUnreadCount(unreadMessages.length);
  // }, [messages]);
  useEffect(() => {
    fetchOtherUserToken();
    const unsubscribe = initializeChat();
    return () => {
      if (unsubscribe) unsubscribe;
    };
  }, [roomId, user, userId]);

  useEffect(() => {
    markMessagesAsRead();
  }, [roomId, user?.userId, messages]);

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
                latitude: data.location?.latitude,
                longitude: data.location?.longitude,
              }
            : null,
          duration: data.type === "audio" ? data.duration : null,
        } as IMessage;
      });
      setMessages(fetchedMessages);
      cacheMessages(roomId, fetchedMessages);
    });

    return unsubscribe;
  };

  const openPicker = async (SelectType: any) => {
    const result: ImagePicker.ImagePickerResult =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [SelectType],
        allowsEditing: true,
        quality: 1,
      });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUrl(result.assets[0].uri);
      setImageModalVisibility(true);
    }
  };

  const uploadMediaFile = async (
    media: { uri: string | URL | Request },
    username: string
  ) => {
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
      where("senderId", "!=", user?.userId),
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
      const userRef = doc(db, "users", userId as string);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setOtherUserToken(userDoc.data().deviceToken);
      }
    } catch (error) {
      console.error("Error fetching other user's token:", error);
    }
  };

  const handleSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const newMessage: IMessage = newMessages[0];

      // Prepare message for Firestore
      const messageData: FirebaseMessage = {
        content: newMessage.text || "",
        senderId: user?.userId,
        senderName: user?.username,
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
        duration: newMessage.type === "audio" ? durationToString() : null,
      };

      // Update local messages state
      setMessages((prevMessages: IMessage[]) =>
        GiftedChat.append(prevMessages, newMessages)
      );

      try {
        const roomRef = doc(db, "rooms", roomId);
        const messagesRef = collection(roomRef, "messages");

        // Add message to Firestore
        await setDoc(doc(messagesRef), messageData);

        // Update room last message
        updateRoomLastMessage(newMessage);

        // Send notification if other user token exists
        if (otherUserToken) {
          sendNotification(
            otherUserToken,
            `${user?.username}`,
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

  const updateRoomLastMessage = async (
    newMessage: IMessage = messages[messages.length - 1]
  ) => {
    const roomRef = doc(db, "rooms", roomId);
    // Update room last message
    await setDoc(
      roomRef,
      {
        lastMessage: messageBody(newMessage),
        lastMessageTimestamp: getCurrentTime(),
        lastMessageSenderId: user?.userId,
      },
      { merge: true }
    );
  };

  const messageBody = (newMessage: IMessage) => {
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

  const handleDelete = async (message: IMessage) => {
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
              const messageRef = doc(
                roomRef,
                "messages",
                message._id as string
              );

              await deleteDoc(messageRef);

              setMessages((prevMessages: IMessage[]) =>
                prevMessages.filter((msg) => msg._id !== message._id)
              );
              updateRoomLastMessage();
            } catch (error) {
              console.error("Failed to delete message", error);
            }
          },
        },
      ]
    );
  };

  const handleMessagePress = useCallback(
    (context: any, currentMessage: IMessage) => {
      if (!currentMessage.text) return;

      const options = [];

      if (currentMessage.user._id === user?.userId) {
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
        (buttonIndex: number) => {
          switch (buttonIndex) {
            case 0:
              Clipboard.setStringAsync(currentMessage.text);
              break;
            case 1:
              if (currentMessage.user._id === user?.userId) {
                setIsEditing(true);
                setEditMessage(currentMessage);
                setEditText(currentMessage.text);
                // setShowActionButtons(false);
              }
              break;
            case 2:
              if (currentMessage.user._id === user?.userId)
                handleDelete(currentMessage);
              break;
            default:
              break;
          }
        }
      );
    },
    [user?.userId, handleDelete, isEditing]
  );

  const handleEditSave = async () => {
    if (!editMessage || !editText) return;

    try {
      const roomRef = doc(db, "rooms", roomId);
      const messageRef = doc(roomRef, "messages", editMessage._id as string);

      await updateDoc(messageRef, { content: editText });

      setEditText("");
      setEditMessage(null);
      setIsEditing(false);

      setMessages((prevMessages: IMessage[]) =>
        prevMessages.map((msg) =>
          msg._id === editMessage?._id ? { ...msg, text: editText } : msg
        )
      );
      updateRoomLastMessage();
    } catch (error) {
      console.error("Failed to edit message:", error);
      Alert.alert("Error", "Failed to edit message. Please try again.");
    }
  };

  const renderBubble = (props: any) => {
    const { currentMessage } = props;

    let ticks = null;
    if (currentMessage.user._id === user?.userId) {
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

  const renderCustomView = useCallback((props: any) => {
    return <CustomView {...props} />;
  }, []);

  const renderMessageAudio = (props: any) => {
    const { currentMessage } = props;

    // Only render if it's an audio message
    if (currentMessage.type === "audio" && currentMessage.audio) {
      return (
        <AudioPlayerComponent
          currentAudio={currentMessage.audio}
          selectedTheme={selectedTheme}
          profileUrl={profileUrl}
          playBackDuration={currentMessage.duration}
        />
      );
    }

    return null;
  };

  const durationToString = () => {
    return playbackTime % 60 < 10
      ? `${(playbackTime / 60).toFixed(0)}:0${playbackTime % 60}`
      : `${(playbackTime / 60).toFixed(0)}:${playbackTime % 60}`;
  };
  
  return (
    <View style={{ flex: 1 }}>
      <ChatRoomBackground source={chatBackgroundPic} />
      <StatusBar
        style={
          `${
            selectedTheme === purpleTheme
              ? "light"
              : selectedTheme.Statusbar.style
          }` as StatusBarStyle | undefined
        }
        backgroundColor={selectedTheme.primary}
        animated={true}
      />
      <View style={{ position: "absolute", zIndex: 5, width: "100%" }}>
        <TopHeaderBar
          theme={selectedTheme}
          title={username as string}
          profileUrl={profileUrl}
        />
      </View>
      <View style={styles.crContainer as ViewStyle}>
        <GiftedChat
          onInputTextChanged={(text) => {
            if (text.length > 0) {
              setShowActionButtons(false);
            } else {
              setShowActionButtons(true);
            }
          }}
          messagesContainerStyle={styles.crMessages as ViewStyle}
          keyboardShouldPersistTaps="always"
          alwaysShowSend={false}
          renderCustomView={renderCustomView}
          renderComposer={(props) =>
            isEditing ? (
              <View style={styles.editContainer as ViewStyle}>
                <TextInput
                  value={editText}
                  onChangeText={setEditText}
                  style={styles.editInput as TextStyle}
                  autoFocus
                  multiline={true}
                  numberOfLines={5}
                />
                <TouchableOpacity
                  onPress={() => {
                    setIsEditing(false);
                    // setShowActionButtons(true);
                    handleEditSave();
                  }}
                  style={styles.editButton as ViewStyle}
                >
                  <Text style={styles.editButtonText as TextStyle}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditing(false);
                    // setShowActionButtons(true);
                  }}
                  style={styles.editButton as ViewStyle}
                >
                  <MaterialIcons
                    name="close"
                    size={20}
                    style={styles.editButtonText as TextStyle}
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
                  marginLeft: 25,
                }}
              />
            )
          }
          messages={messages as IMessage[] | undefined}
          onSend={(newMessages: IMessage[]) => {
            handleSend(newMessages);
            // setShowActionButtons(true);
          }}
          user={
            {
              _id: user?.userId,
              name: user?.username,
            } as any
          }
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
              setLoadingIndicator={setLoadingIndicator}
              setPlaybackTime={setPlaybackTime}
            />
          )}
          renderMessageAudio={renderMessageAudio}
          timeTextStyle={{
            left: { color: selectedTheme.message.other.time },
            right: { color: selectedTheme.message.user.time },
          }}
          renderBubble={renderBubble}
          renderActions={() =>
            !isEditing ? (
              <ActionButtons
                recipient={username as string | null}
                onSend={handleSend}
                openPicker={openPicker}
                user={user as any}
                uploadMediaFile={uploadMediaFile}
              />
            ) : null
          }
          renderChatEmpty={() => (
            <View style={{ transform: [{ rotate: "180deg" }], bottom: -300 }}>
              <EmptyChatRoomList />
            </View>
          )}
          scrollToBottom={true}
          scrollToBottomComponent={() => (
            <Animated.View
              entering={BounceIn.duration(200)}
              exiting={BounceOut.duration(200)}
            >
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
                  styles.crScrollToEndButton as any,
                  { bottom: unreadCount > 0 ? 10 : null },
                ]}
                name="double-arrow"
                color={"#000"}
                size={30}
              />
            </Animated.View>
          )}
          renderMessageImage={(props) => (
            <RenderMessageImage
              imageStyle={
                {
                  borderTopLeftRadius:
                    props.currentMessage.user._id === user?.userId ? 13 : 0,
                  borderTopRightRadius:
                    props.currentMessage.user._id === user?.userId ? 0 : 13,
                } as any
              }
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
            image={imageUrl as string}
            uploadMediaFile={
              uploadMediaFile as (
                media: MediaFile,
                username: string
              ) => Promise<string | null>
            }
          />
        )}
        {loadingIndicator && (
          <LoadingIndicator
            containerStyles={{ bottom: 54, height: null, paddingBottom: 50 }}
            showIndicator={false}
            children={
              <View style={{ alignItems: "center" }}>
                <LottieView
                  source={require("../myAssets/Lottie_Files/Recording.json")}
                  autoPlay
                  loop={true}
                  style={{ width: 80, height: 80 }}
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "semibold",
                    color: "white",
                  }}
                >
                  Recording...
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "semibold",
                    color: "white",
                  }}
                >
                  {playbackTime % 60 < 10
                    ? `${(playbackTime / 60).toFixed(0)}:0${playbackTime % 60}`
                    : `${(playbackTime / 60).toFixed(0)}:${playbackTime % 60}`}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

export default ChatScreen;
