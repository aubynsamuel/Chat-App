import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../AuthContext';
import { useEffect, useState } from 'react';
import { formatTimeWithoutSeconds, getRoomId } from '../../commons';
import { db } from '../../firebaseConfig';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  limit,
  where,
  getDocs
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatObject = ({ users }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [lastMessage, setLastMessage] = useState(null);
  const [lastMessageTime, setLastMessageTime] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [imageFailedToLoad, setImageFailedToLoad] = useState(false);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const roomId = getRoomId(user?.userId, users.userId);
        const docRef = doc(db, 'rooms', roomId);
        const messagesRef = collection(docRef, 'messages');

        // Retrieve the last seen message timestamp from AsyncStorage
        const lastSeenMessageTimestamp = await AsyncStorage.getItem(`lastSeenMessage_${roomId}`);
        const lastSeenTimestamp = lastSeenMessageTimestamp ? new Date(lastSeenMessageTimestamp) : null;

        // Query unread messages where the sender is not the current user
        let q;
        if (lastSeenTimestamp) {
          q = query(
            messagesRef,
            where('createdAt', '>', lastSeenTimestamp),
            where('senderId', '!=', user?.userId)
          );
        } else {
          q = query(
            messagesRef,
            where('senderId', '!=', user?.userId)
          );
        }

        const querySnapshot = await getDocs(q);
        setUnreadCount(querySnapshot.size); // Count of unread messages not sent by the user
      } catch (error) {
        console.error('Error fetching unread messages:', error);
      }
    };

    fetchUnreadMessages();
  }, [users.userId, user?.userId]);

  // Listener to track the last message in the conversation
  useEffect(() => {
    const roomId = getRoomId(user?.userId, users.userId);
    const docRef = doc(db, 'rooms', roomId);
    const messagesRef = collection(docRef, 'messages');

    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));

    const unsubscribe = onSnapshot(q, snapshot => {
      if (!snapshot.empty) {
        const lastMessageData = snapshot.docs[0].data();
        setLastMessage(lastMessageData);
      } else {
        setLastMessage(null);
      }
    });

    return () => unsubscribe();
  }, [users.userId]);

  // Update lastMessageTime based on the last message's timestamp
  useEffect(() => {
    if (lastMessage && lastMessage.createdAt) {
      setLastMessageTime(formatTimeWithoutSeconds(lastMessage.createdAt));
    } else {
      setLastMessageTime('');
    }
  }, [lastMessage]);

  const handlePress = async () => {
    const roomId = getRoomId(user?.userId, users.userId);

    // Reset unread count to zero when the chat is opened
    setUnreadCount(0);

    // Update the last seen message timestamp when opening the chat
    if (lastMessage && lastMessage.createdAt) {
      await AsyncStorage.setItem(`lastSeenMessage_${roomId}`, lastMessage.createdAt);
    }

    navigation.navigate('ChatScreen', {
      userId: users.userId,
      username: users.username,
      profileUrl: users.profileUrl,
    });
  };

  return (
    <TouchableOpacity style={styles.chatBox} onPress={handlePress}>
      <View style={[styles.chatBox, { width: '82%', justifyContent: 'flex-start' }]}>
        {/* Avatar */}
        <View>
          <TouchableOpacity>
            {imageFailedToLoad ? (
              <Image
                style={[styles.avatar]}
                source={require('../../assets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp')}
                transition={500}
              />
            ) : (
              <Image
                style={[styles.avatar]}
                source={{ uri: users.profileUrl }}
                transition={500}
                onError={error => {
                  console.error('Error loading image:', error);
                  setImageFailedToLoad(true);
                }}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={{ marginLeft: 8, width: '80%' }}>
          {/* Username */}
          <Text numberOfLines={1} style={styles.name}>
            {users.username}
          </Text>

          {/* Last message */}
          <Text numberOfLines={1} style={styles.lastMessage}>
            {lastMessage?.senderId !== user?.userId
              ? `You: ${lastMessage?.content || ''}`
              : lastMessage?.content || ''}
          </Text>
        </View>
      </View>

      <View>
        {/* Time of last message */}
        <Text style={styles.time}>{lastMessageTime}</Text>
        {/* Number of unread messages */}
        {unreadCount > 0 && (
          <Text style={styles.unread}>{unreadCount}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    borderColor: 'gray',
    overflow: 'hidden',
    zIndex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
  },
  lastMessage: {
    fontSize: 14,
    color: 'gray',
  },
  time: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 2,
    alignSelf: 'flex-end',
  },
  unread: {
    color: 'red',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
});

export default ChatObject;
