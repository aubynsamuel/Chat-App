import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  Keyboard,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {db} from '../../firebaseConfig';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
} from 'firebase/firestore';
import {useAuth} from '../AuthContext';
import TopHeaderBar from '../components/HeaderBar_ChatScreen ';
import {getRoomId} from '../../commons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getCurrentTime, formatTimeWithoutSeconds} from '../../commons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatScreen = () => {
  const route = useRoute();
  const {userId, username, profileUrl} = route.params;
  const {user} = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const textRef = useRef('');
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const getLastMessage = async () => {
      if (messages.length > 0) {
        let lastMessage = messages[messages.length - 1];
        await AsyncStorage.setItem(
          `lastMessage_${userId}`,
          JSON.stringify(lastMessage),
        );
      }
    };
    getLastMessage();
  }, [messages]);

  useEffect(() => {
    const roomId = getRoomId(user.userId, userId);
    const fetchCachedMessages = async () => {
      try {
        const cachedMessages = await AsyncStorage.getItem(`messages_${roomId}`);
        if (cachedMessages) {
          const sortedCachedMessages = JSON.parse(cachedMessages).sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
          );
          setMessages(sortedCachedMessages); // Set cached messages
          setIsLoading(false); // Loading complete
        }
      } catch (error) {
        console.error('Failed to fetch cached messages', error);
      } finally {
        setIsLoading(false); // Ensure loading flag is reset
      }
    };

    const cacheMessages = async newMessages => {
      try {
        const sortedMessages = newMessages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
        await AsyncStorage.setItem(
          `messages_${roomId}`,
          JSON.stringify(sortedMessages),
        );
      } catch (error) {
        console.error('Failed to cache messages', error);
      }
    };

    const fetchLatestMessages = async () => {
      try {
        const docRef = doc(db, 'rooms', roomId);
        const messagesRef = collection(docRef, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));
        let unsubscribe = onSnapshot(q, snapshot => {
          const allMessages = snapshot.docs.map(doc => doc.data());
          const sortedMessages = allMessages.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
          );
          setMessages(sortedMessages); // Set latest messages
          cacheMessages(sortedMessages); // Cache the messages
          updateScrollToEnd(); // Ensure to scroll to the bottom
        });

        return () => unsubscribe; // Cleanup Firestore listener
      } catch (error) {
        console.error('Failed to fetch latest messages', error);
      }
    };

    const initializeMessages = async () => {
      await fetchCachedMessages(); // Fetch cached messages first
      const unsubscribe = await fetchLatestMessages(); // Fetch Firestore messages
      return unsubscribe; // Return cleanup function
    };

    createRoomIfItDoesNotExist(roomId);

    const unsubscribeFromFirestore = initializeMessages(); // Initialize messages

    const KeyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      updateScrollToEnd,
    );

    return () => {
      unsubscribeFromFirestore; // Unsubscribe from Firestore on unmount
      KeyboardDidShowListener.remove(); // Remove keyboard listener
    };
  }, [userId, user]);

  const updateScrollToEnd = () => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({animated: true});
      }
    }, 500);
  };

  useEffect(() => {
    updateScrollToEnd();
  }, [messages]);

  const createRoomIfItDoesNotExist = async roomId => {
    await setDoc(doc(db, 'rooms', roomId), {
      roomId,
      createdAt: getCurrentTime(),
    });
  };

  const handleSend = async () => {
    const message = textRef.current.trim();
    if (inputRef.current) inputRef.current.clear();
    textRef.current = '';
    if (!message) return;
    try {
      const roomId = getRoomId(user.userId, userId);
      const docRef = doc(db, 'rooms', roomId);
      const messagesRef = collection(docRef, 'messages');
      await addDoc(messagesRef, {
        type: 'text',
        content: message,
        senderId: user?.userId,
        senderName: user?.username,
        createdAt: getCurrentTime(),
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{flex: 1}}>
      <StatusBar barStyle="dark-content" backgroundColor="lightblue" />
      <TopHeaderBar
        title={username}
        backButtonShown={true}
        profileUrl={profileUrl}
      />

      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({item}) => {
            const isUserMessage = item.senderId === user?.userId;
            const messageStyle = isUserMessage
              ? styles.userMessage
              : styles.otherMessage;
            if (item.type === 'text') {
              return (
                <View
                  style={
                    isUserMessage
                      ? styles.userMessageContainer
                      : styles.otherMessageContainer
                  }>
                  <Text style={messageStyle}>{item.content}</Text>
                  <Text
                    style={isUserMessage ? styles.userTime : styles.otherTime}>
                    {formatTimeWithoutSeconds(item.createdAt)}
                  </Text>
                </View>
              );
            } else if (item.type === 'image') {
              return (
                <Image source={{uri: item.content}} style={styles.image} />
              );
            }
          }}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
          initialNumToRender={messages.length}
        />
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            onChangeText={value => (textRef.current = value)}
            style={styles.textInputField}
            placeholder="Type a message..."
            placeholderTextColor={'grey'}
            numberOfLines={1}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={styles.imagePickerButton}>
            <Icon
              name="send"
              color={'black'}
              size={25}
              style={{
                transform: [{rotate: '-50deg'}],
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 1,
  },
  messages: {
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 10,
    borderRadius: 10,
  },
  textInputField: {
    width: '90%',
    color: '#000',
    paddingHorizontal: 10,
    fontSize: 16,
    flex: 1,
  },
  imagePickerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMessageContainer: {
    backgroundColor: 'lightgrey',
    borderRadius: 7,
    marginVertical: 5,
    alignSelf: 'flex-end',
    maxWidth: '80%',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  otherMessageContainer: {
    backgroundColor: '#c8ecee',
    borderRadius: 7,
    marginVertical: 5,
    alignSelf: 'flex-start',
    maxWidth: '80%',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  userMessage: {
    fontSize: 16,
    color: '#000',
  },
  otherMessage: {
    fontSize: 16,
    color: '#000',
  },
  userTime: {
    fontSize: 10,
    color: 'grey',
    alignSelf: 'flex-start',
  },
  otherTime: {
    fontSize: 10,
    color: 'grey',
    alignSelf: 'flex-end',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
});

export default ChatScreen;
