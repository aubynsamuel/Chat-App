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
  setDoc,
  updateDoc,
  increment,
  getDoc,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import {useAuth} from '../AuthContext';
import TopHeaderBar from '../components/HeaderBar_ChatScreen ';
import {getRoomId} from '../../commons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getCurrentTime} from '../../commons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MessageObject from '../components/MessageObject';
import LottieView from 'lottie-react-native';

const ChatScreen = () => {
  const route = useRoute();
  const {userId, username, profileUrl} = route.params;
  const {user} = useAuth();
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const roomId = getRoomId(user.userId, userId);

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

    const subscribeToMessages = () => {
      const docRef = doc(db, 'rooms', roomId);
      const messagesRef = collection(docRef, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));

      return onSnapshot(q, snapshot => {
        const allMessages = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        const sortedMessages = allMessages.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
        setMessages(sortedMessages);
        cacheMessages(sortedMessages);
        updateScrollToEnd();
      });
    };

    const initializeChat = async () => {
      await createRoomIfItDoesNotExist();
      await fetchCachedMessages();
      const unsubscribe = subscribeToMessages();
      // markMessagesAsRead();

      return () => {
        unsubscribe();
      };
    };

    const unsubscribe = initializeChat();

    const KeyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      updateScrollToEnd,
    );

    return () => {
      if (unsubscribe) {
        unsubscribe;
      }
      KeyboardDidShowListener.remove();
    };
  }, [roomId]);

  const updateScrollToEnd = () => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({animated: true});
      }
    }, 100);
  };

  const createRoomIfItDoesNotExist = async () => {
  const roomRef = doc(db, 'rooms', roomId);
  
  // Check if the room already exists
  const roomSnapshot = await getDoc(roomRef);
  
  if (!roomSnapshot.exists()) {
    // Room does not exist, create it with default values
    await setDoc(
      roomRef,
      {
        roomId,
        participants: [user.userId, userId],
        createdAt: getCurrentTime(),
        lastMessage: '',
        lastMessageTimestamp: getCurrentTime(),
        lastMessageSenderId: '',
      },
      { merge: true }
    );
  } else {
    console.log('Room already exists');
  }
};


  // const markMessagesAsRead = async () => {
  //   try {
  //     const roomRef = doc(db, 'rooms', roomId);
  //     await updateDoc(roomRef, {
  //       [`unreadCount.${user.userId}`]: 0,
  //     });
  //   } catch (error) {
  //     console.error('Failed to mark messages as read:', error);
  //   }
  // };

  useEffect(() => {
    let typingTimeout;
    if (isTyping) {
      typingTimeout = setTimeout(() => setIsTyping(false), 1000);
    }
    return () => clearTimeout(typingTimeout);
  }, [isTyping]);

  const handleSend = async () => {
    const message = inputText.trim();
    setInputText('');
    setIsTyping(false);
    if (!message) return;

    try {
      const currentTime = getCurrentTime();
      const roomRef = doc(db, 'rooms', roomId);
      const messagesRef = collection(roomRef, 'messages');

      // Create the message document
      const messageData = {
        type: 'text',
        content: message,
        senderId: user?.userId,
        senderName: user?.username,
        read: false,
        createdAt: currentTime,
      };

      // Add the message to the messages collection
      await addDoc(messagesRef, messageData);

      // Update room metadata
      await updateDoc(roomRef, {
        lastMessage: message,
        lastMessageTimestamp: currentTime,
        lastMessageSenderId: user?.userId,
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
          keyExtractor={item => item.id}
          renderItem={({item}) => <MessageObject item={item} />}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
          initialNumToRender={messages.length}
          onContentSizeChange={updateScrollToEnd}
        />
        <View style={styles.inputContainer}>
          {isTyping && (
            <LottieView
              source={require('../../assets/Lottie_Files/Typing Dots.json')}
              autoPlay
              loop
              style={{
                width: 50,
                height: 50,
                alignSelf: 'flex-start',
                flex: 0.1,
                position: 'absolute',
                top: -35,
              }}
            />
          )}
          <TextInput
            value={inputText}
            onChangeText={text => {
              setIsTyping(true);
              setInputText(text);
            }}
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
    paddingBottom: 10,
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