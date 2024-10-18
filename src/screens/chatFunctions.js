import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
} from 'firebase/firestore';
import {db} from '../../firebaseConfig';
import {getRoomId, getCurrentTime} from '../../commons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchCachedMessages = async (roomId, setMessages) => {
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

export const cacheMessages = async (roomId, newMessages) => {
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

export const fetchLatestMessages = async (roomId, setMessages) => {
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
      cacheMessages(roomId, sortedMessages);
    });

    return () => unsubscribe;
  } catch (error) {
    console.error('Failed to fetch latest messages', error);
  }
};

export const createRoomIfItDoesNotExist = async roomId => {
  await setDoc(doc(db, 'rooms', roomId), {
    roomId,
    createdAt: getCurrentTime(),
  });
};

export const updateScrollToEnd = flatListRef => {
  setTimeout(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, 500);
};

export const handleSendMessage = async (user, userId, textRef, inputRef) => {
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
