import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
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
  setDoc, where,
  getDocs,
  updateDoc,
  
} from 'firebase/firestore';
import {useAuth} from '../AuthContext';
import TopHeaderBar from '../components/HeaderBar_ChatScreen ';
import {getRoomId} from '../../commons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getCurrentTime} from '../../commons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MessageObject from '../components/MessageObject';

const ChatScreen = () => {
  const route = useRoute();
  const {userId, username, profileUrl} = route.params;
  const {user} = useAuth();
  const [messages, setMessages] = useState([]);
  const textRef = useRef('');
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  const updateMessagesReadStatus = async () => {
    try {
      const roomId = getRoomId(user.userId, userId);
      const messagesRef = collection(db, 'rooms', roomId, 'messages');
      const q = query(
        messagesRef,
        where('senderId', '!=', user?.userId),
        where('read', '==', false),
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(async doc => {
        await updateDoc(doc.ref, {read: true});
      });
    } catch (error) {
      console.error('Failed to update message read status', error);
    }
  };
  updateMessagesReadStatus(); 

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
          setMessages(sortedCachedMessages);
        }
      } catch (error) {
        console.error('Failed to fetch cached messages', error);
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
          setMessages(sortedMessages);
          cacheMessages(sortedMessages);
          updateScrollToEnd();
        });

        return () => unsubscribe;
      } catch (error) {
        console.error('Failed to fetch latest messages', error);
      }
    };

    const initializeMessages = async () => {
      await fetchCachedMessages();
      const unsubscribe = await fetchLatestMessages();
      // await updateMessagesReadStatus(); // Then update read status
      return unsubscribe;
    };

    createRoomIfItDoesNotExist(roomId);

    const unsubscribeFromFirestore = initializeMessages();

    const KeyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      updateScrollToEnd,
    );

    return () => {
      unsubscribeFromFirestore;
      KeyboardDidShowListener.remove();
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
        read: false,
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
          renderItem={({item}) => <MessageObject item={item}/>}
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
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
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
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;
