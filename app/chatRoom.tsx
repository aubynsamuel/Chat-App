import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  Dimensions,
} from "react-native";
import {
  GiftedChat,
  Send,
  Composer,
  BubbleProps,
  MessageAudioProps,
  MessageTextProps,
  ComposerProps,
  InputToolbarProps,
  MessageImageProps,
  SendProps,
} from "react-native-gifted-chat";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
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
  formatTime,
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
import { TextStyle } from "react-native";
import { ThemeContextType } from "../context/ThemeContext";
import darkTheme from "../Themes/DarkMode";
import { IMessage, FirebaseMessage } from "../Functions/types";
import { ChatProvider, useChatContext } from "../context/ChatContext";
import AudioRecordingOverlay from "../components/AudioRecordingOverlay";
import RenderMessageText from "../components/RenderMessageText";
import RenderBubble from "@/components/RenderBubble";
import { useHighlightStore } from "@/context/MessageHighlightStore";
import ScreenOverlay from "@/components/ScreenOverlay";
import { useProfileURlStore } from "@/context/ProfileUrlStore";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { useAudioManager } from "@/Functions/AudioCacheManager";
// import { Vibration } from "react-native";

const ChatScreen = () => {
  const { otherUsersUserId, otherUsersUsername, otherUsersToken } =
    useLocalSearchParams();
  const { user } = useAuth() as AuthContextType;
  const { selectedTheme, chatBackgroundPic }: ThemeContextType = useTheme();
  const {
    isRecording,
    setIsRecording,
    setAudioRecordingOverlay,
    setPlaybackTime,
    audioRecordingOverlay,
    playbackTime,
    recordedAudioUri,
    setRecordedAudioUri,
    setImageModalVisibility,
    imageModalVisibility,
    setGettingLocationOverlay,
    gettingLocationOverlay,
  } = useChatContext();
  const highlightMessage = useHighlightStore((state) => state.highlightMessage);
  const profileUrl = useProfileURlStore((state) => state.profileUrl);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const roomId: any = useMemo(
    () => getRoomId(user?.userId, otherUsersUserId),
    [otherUsersUserId]
  );
  const styles = getStyles(selectedTheme);
  const [isEditing, setIsEditing] = useState(false);
  const [editMessage, setEditMessage] = useState<IMessage | null | undefined>();
  const [editText, setEditText] = useState("");
  const showActions = useRef(true);
  const [imageUrl, setImageUrl] =
    useState<React.SetStateAction<string | null>>("");
  const messageContainerRef = useRef<any>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<IMessage | null>(null);
  const { audioCacheManager } = useAudioManager();

  useEffect(() => {
    return () => {
      setGettingLocationOverlay(false);
      setIsReplying(false);
      setReplyToMessage(null);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = initializeChat();
    return () => {
      if (unsubscribe) unsubscribe;
    };
  }, [roomId, user, otherUsersUserId]);

  useEffect(() => {
    markMessagesAsRead();
  }, [roomId, user?.userId, messages]);

  const initializeChat = async () => {
    const roomRef = doc(db, "rooms", roomId);
    const messagesRef = collection(roomRef, "messages");
    const q = query(messagesRef, orderBy("createdAt", "desc"));

    try {
      const cachedMessages = await fetchCachedMessages(roomId);
      if (cachedMessages && cachedMessages.length > 0) {
        setMessages(cachedMessages);
      }

      await createRoomIfItDoesNotExist(roomId, user, otherUsersUserId);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        // snapshot.docChanges().forEach((change) => {
        //   if (change.type === "added") {
        //     const message = change.doc.data();
        //     if (
        //       message.senderId !== user?.userId &&
        //       change.doc.data().createdAt?.toDate() > new Date(Date.now() - 1000)
        //     ) {
        //       Vibration.vibrate([0, 60, 60, 40]);
        //     }
        //   }
        // });

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
        return unsubscribe;
      });
    } catch (error) {
      console.error("Error initializing chat:", error);
    }
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

  const handleSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const newMessage: IMessage = newMessages[0];

      const replyData = replyToMessage
        ? {
            _id: replyToMessage._id,
            text: replyToMessage.text || "",
            user: replyToMessage.user,
            type: replyToMessage.type,
            image: replyToMessage.image || null,
            audio: replyToMessage.audio || null,
            location: replyToMessage.location || null,
          }
        : null;

      newMessage.replyTo = replyData;

      // Prepare message for Firestore
      const messageData: FirebaseMessage = {
        content: newMessage.text || "",
        senderId: user?.userId,
        senderName: user?.username,
        createdAt: getCurrentTime(),
        replyTo: replyData,
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
        duration: newMessage.duration || null,
      };

      setReplyToMessage(null);
      setIsReplying(false);

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
        if (otherUsersToken) {
          sendNotification(
            otherUsersToken as string, //change to otherUsersToken
            user?.username as string, //title of notification
            messageBody(newMessage),
            roomId,
            otherUsersUserId as string,
            user?.userId as string
          );
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [isReplying, replyToMessage]
  );

  const scrollToMessage = (messageId?: string | number) => {
    const index = messages.findIndex((message) => message._id === messageId);
    if (index !== -1 && messageContainerRef.current) {
      messageContainerRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
      if (messageId) {
        highlightMessage(messageId as string);
      }
    }
  };

  const updateRoomLastMessage = async (newMessage: IMessage) => {
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
      return `🔉 ${newMessage.duration}` || `🔉 Sent an audio`;
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
              // updateRoomLastMessage();
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

      const options = ["Reply"];

      if (currentMessage.user._id === user?.userId) {
        options.push("Copy Text");
        options.push("Edit Message");
        options.push("Delete Message");
      } else {
        options.push("Copy Text");
      }
      options.push("Cancel");
      const cancelButtonIndex = options.length - 1;

      const title = ` ${
        currentMessage.type === "location" ? "Location: " : "Message: "
      } ${
        currentMessage.text.length > 80
          ? currentMessage.text.substring(0, 80) + "..."
          : currentMessage.text
      }`;
      const textStyle: TextStyle = {
        textAlign: "center",
        alignSelf: "center",
        width: "100%",
        fontWeight: "500",
        color: selectedTheme.text.primary,
      };
      const destructiveColor = "red";
      const destructiveButtonIndex = options.includes("Delete Message")
        ? options.indexOf("Delete Message")
        : options.indexOf("Cancel");
      const titleTextStyle: TextStyle = {
        fontWeight: "400",
        textAlign: "center",
        color: selectedTheme.text.primary,
      };
      const containerStyle: ViewStyle = {
        alignItems: "center",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: selectedTheme.background,
      };
      const showSeparators = true;
      context.actionSheet().showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title,
          titleTextStyle,
          containerStyle,
          textStyle,
          destructiveColor,
          destructiveButtonIndex,
          showSeparators,
        },
        (buttonIndex: number | undefined) => {
          switch (buttonIndex) {
            case 0: {
              setReplyToMessage(currentMessage);
              setIsReplying(true);
              break;
            }
            case 1:
              Clipboard.setStringAsync(currentMessage.text);
              break;
            case 2:
              if (currentMessage.user._id === user?.userId) {
                setIsEditing(true);
                setEditMessage(currentMessage);
                setEditText(currentMessage.text);
              }
              break;
            case 3:
              if (currentMessage.user._id === user?.userId)
                handleDelete(currentMessage);
              break;
            default:
              break;
          }
        }
      );
    },
    [handleDelete, isEditing, isReplying, replyToMessage, editMessage, editText]
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
      // updateRoomLastMessage();
    } catch (error) {
      console.error("Failed to edit message:", error);
      Alert.alert("Error", "Failed to edit message. Please try again.");
    }
  };

  const uploadAudioFile = async (
    audioUri: string,
    username: string | null | undefined
  ): Promise<string | null> => {
    try {
      const response = await fetch(audioUri);
      const blob = await response.blob();
      const storageRef = ref(
        storage,
        `chatAudio/${username}_${Date.now()}.m4a`
      );
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading audio:", error);
      return null;
    }
  };

  const resetRecording = () => {
    setRecordedAudioUri("");
    setAudioRecordingOverlay(false);
    setPlaybackTime(0);
    setIsRecording(false);
  };

  const sendAudioMessage = async () => {
    try {
      if (!recordedAudioUri || !user) {
        Alert.alert("Error", "No audio file found");
        return;
      }

      // Create message with local URI first
      const tempMessage: IMessage = {
        _id: Math.random().toString(36).substring(7),
        text: "",
        audio: recordedAudioUri, // Use local URI initially
        createdAt: new Date(),
        user: {
          _id: user.userId,
          name: user.username as string,
        },
        type: "audio",
        delivered: true,
        duration: formatTime(playbackTime),
      };

      // Add to messages immediately for instant feedback
      setMessages((prevMessages) =>
        GiftedChat.append(prevMessages, [tempMessage])
      );

      // Upload the audio file
      const downloadURL = await uploadAudioFile(
        recordedAudioUri,
        user.username
      );
      if (!downloadURL) {
        Alert.alert("Error Sending Message", "No internet connection");
        return;
      }

      // Update cache manager with the mapping
      await audioCacheManager?.updateRecordedAudioUri(
        recordedAudioUri,
        downloadURL
      );

      // Send the message with the Firebase URL
      const finalMessage = { ...tempMessage, audio: downloadURL };
      handleSend([finalMessage]);

      resetRecording();
    } catch (error) {
      console.error("Error sending audio message:", error);
      Alert.alert("Error", "Failed to send audio message");
    }
  };

  const renderCustomView = useCallback((props: any) => {
    return <CustomView {...props} />;
  }, []);

  const renderMessageAudio = useCallback(
    (props: MessageAudioProps<IMessage>) => {
      const { currentMessage } = props;

      // Only render if it's an audio message
      if (currentMessage.type === "audio" && currentMessage.audio) {
        return (
          <AudioPlayerComponent
            props={props}
            selectedTheme={selectedTheme}
            profileUrl={
              currentMessage.user._id === user?.userId
                ? user?.profileUrl
                : profileUrl
            }
            playBackDuration={currentMessage.duration}
            setReplyToMessage={setReplyToMessage}
            setIsReplying={setIsReplying}
            handleDelete={handleDelete}
            user={user}
          />
        );
      }

      return null;
    },
    [isReplying, handleDelete, replyToMessage]
  );

  return (
    <View style={{ flex: 1 }}>
      <ChatRoomBackground source={chatBackgroundPic} />
      <StatusBar
        style={selectedTheme.Statusbar.style as StatusBarStyle | undefined}
        backgroundColor={selectedTheme.Statusbar.backgroundColor}
        animated={true}
      />
      <View style={{ position: "absolute", zIndex: 5, width: "100%" }}>
        <TopHeaderBar
          theme={selectedTheme}
          title={otherUsersUsername as string}
          profileUrl={profileUrl}
        />
      </View>
      <View style={styles.crContainer as ViewStyle}>
        <GiftedChat
          messageContainerRef={messageContainerRef}
          messagesContainerStyle={styles.crMessages as ViewStyle}
          messages={messages as IMessage[] | undefined}
          onPress={handleMessagePress}
          scrollToBottom={true}
          keyboardShouldPersistTaps="always"
          alwaysShowSend={false}
          renderCustomView={renderCustomView}
          renderMessageAudio={renderMessageAudio}
          renderBubble={useCallback(
            (props: Readonly<BubbleProps<IMessage>>) => (
              <RenderBubble
                props={props}
                setIsReplying={setIsReplying}
                setReplyToMessage={setReplyToMessage}
              />
            ),
            [isReplying, replyToMessage]
          )}
          renderAvatar={null}
          onInputTextChanged={(text: string | any[]) => {
            if (text.length > 0) {
              showActions.current = false;
            } else {
              showActions.current = true;
            }
          }}
          renderComposer={useCallback(
            (props: ComposerProps) =>
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
                    activeOpacity={0.5}
                    onPress={() => {
                      setIsEditing(false);
                      handleEditSave();
                    }}
                    style={styles.editButton as ViewStyle}
                  >
                    <Text style={styles.editButtonText as TextStyle}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => {
                      setIsEditing(false);
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
                    justifyContent: "center",
                    borderRadius: 10,
                    marginLeft: showActions.current ? 24 : 19.3,
                  }}
                />
              ),
            [isEditing, showActions.current, handleEditSave, editText]
          )}
          onSend={(newMessages: IMessage[]) => {
            handleSend(newMessages);
          }}
          user={
            {
              _id: user?.userId,
              name: user?.username,
            } as any
          }
          renderMessageText={useCallback(
            (props: MessageTextProps<IMessage>) => (
              <RenderMessageText
                props={props}
                scrollToMessage={scrollToMessage}
                selectedTheme={selectedTheme}
                user={user}
              />
            ),
            [scrollToMessage]
          )}
          renderInputToolbar={useCallback(
            (props: InputToolbarProps<IMessage>) => (
              <InputToolBar
                isReplying={isReplying}
                setIsReplying={setIsReplying}
                selectedTheme={selectedTheme}
                showActions={showActions}
                isEditing={isEditing}
                props={props}
                handleSend={handleSend}
                replyToMessage={replyToMessage}
                setReplyToMessage={setReplyToMessage}
              />
            ),
            [
              isReplying,
              isEditing,
              showActions.current,
              replyToMessage,
              handleSend,
            ]
          )}
          timeTextStyle={{
            left: {
              color:
                selectedTheme === darkTheme
                  ? "#ffffff"
                  : selectedTheme.message.other.time,
            },
            right: { color: selectedTheme.message.user.time },
          }}
          renderActions={useCallback(
            () =>
              !isEditing ? (
                <ActionButtons
                  recipient={otherUsersUsername as string | null}
                  onSend={handleSend}
                  openPicker={openPicker}
                  user={user as any}
                  uploadMediaFile={uploadMediaFile}
                />
              ) : null,
            [isEditing]
          )}
          renderChatEmpty={useCallback(
            () => (
              <View
                style={{
                  transform: [{ rotate: "180deg" }],
                  top: Dimensions.get("window").height / 4,
                }}
              >
                <EmptyChatRoomList />
              </View>
            ),
            []
          )}
          scrollToBottomComponent={useCallback(
            () => (
              <MaterialIcons
                style={[styles.crScrollToEndButton as any]}
                name="double-arrow"
                color={"#000"}
                size={30}
              />
            ),
            []
          )}
          renderMessageImage={useCallback(
            (props: MessageImageProps<IMessage>) => (
              <RenderMessageImage
                imageStyle={
                  {
                    borderTopLeftRadius:
                      props.currentMessage.user._id === user?.userId ? 13 : 0,
                    borderTopRightRadius:
                      props.currentMessage.user._id === user?.userId ? 0 : 13,
                  } as any
                }
                props={props as any}
                setReplyToMessage={setReplyToMessage}
                setIsReplying={setIsReplying}
                handleDelete={handleDelete}
                setEditText={setEditText}
                setEditMessage={setEditMessage}
                setIsEditing={setIsEditing}
                user={user}
              />
            ),
            [
              isReplying,
              isEditing,
              replyToMessage,
              editText,
              handleDelete,
              editMessage,
            ]
          )}
          renderSend={useCallback(
            (props: SendProps<IMessage>) => (
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
                  color={
                    selectedTheme === darkTheme
                      ? "white"
                      : selectedTheme.text.primary
                  }
                  size={25}
                  style={{ transform: [{ rotate: "-40deg" }], bottom: 4 }}
                />
              </Send>
            ),
            []
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
        {audioRecordingOverlay && (
          <AudioRecordingOverlay
            isRecording={isRecording}
            playbackTime={playbackTime}
            resetRecording={resetRecording}
            sendAudioMessage={sendAudioMessage}
          />
        )}
        {gettingLocationOverlay && (
          <ScreenOverlay title={"Getting your location"} />
        )}
      </View>
    </View>
  );
};

const ChatRoomWithContext = () => {
  return (
    <ActionSheetProvider>
      <ChatProvider>
        <ChatScreen />
      </ChatProvider>
    </ActionSheetProvider>
  );
};

export default ChatRoomWithContext;
