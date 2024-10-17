import {View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../AuthContext';
import {useEffect, useState} from 'react';
import {formatTimeWithoutSeconds, getRoomId} from '../../commons';
import {db} from '../../firebaseConfig';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  limit,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatObject = ({users, unread}) => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const [lastMessage, setLastMessage] = useState(null); // Updated to null for better handling
  const [lastMessageTime, setLastMessageTime] = useState('');

  const roomId = getRoomId(user.userId, users.userId);
  const cachedMessages = AsyncStorage.getItem(`messages_${roomId}`);

  useEffect(() => {
    const roomId = getRoomId(user.userId, users.userId);
    const docRef = doc(db, 'rooms', roomId);
    const messagesRef = collection(docRef, 'messages');

    // Query to get only the last message, ordered by 'createdAt'
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));

    // Subscribe to Firestore and listen for real-time updates
    let unsubscribe = onSnapshot(q, snapshot => {
      if (!snapshot.empty) {
        // Get the last message from the snapshot
        const lastMessageData = snapshot.docs[0].data();
        setLastMessage(lastMessageData); // Update state with the last message
      } else {
        setLastMessage(null); // Clear last message if there's no data
      }
    });
    // Cleanup the listener when the component unmounts
    return unsubscribe;
  }, [cachedMessages]);

  useEffect(() => {
    if (lastMessage && lastMessage.createdAt) {
      // Format the last message time only if createdAt is available
      setLastMessageTime(formatTimeWithoutSeconds(lastMessage.createdAt));
    } else {
      setLastMessageTime(''); // Clear the time if no message or createdAt
    }
  }, [lastMessage]);

  const handlePress = () => {
    navigation.navigate('ChatScreen', {
      userId: users.userId,
      username: users.username,
      profileUrl: users.profileUrl,
    });
  };

  return (
    <TouchableOpacity style={styles.chatBox} onPress={handlePress}>
      <View
        style={[styles.chatBox, {width: '82%', justifyContent: 'flex-start'}]}>
        {/* Avatar */}
        <View>
          <TouchableOpacity>
            <Image
              style={[styles.avatar]}
              source={
                users?.profileUrl
                  ? {uri: users.profileUrl}
                  : require('../../assets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp')
              }
            />
          </TouchableOpacity>
        </View>

        <View style={{marginLeft: 8, width: '80%'}}>
          {/* Username */}
          <Text numberOfLines={1} style={styles.name}>
            {users.username}
          </Text>

          {/* Last message */}
          <Text numberOfLines={1} style={styles.lastMessage}>
            {lastMessage?.senderId !== users?.userId
              ? `You: ${lastMessage?.content || ''}`
              : lastMessage?.content || ''}
          </Text>
        </View>
      </View>

      <View>
        {/* Time of last message */}
        <Text style={styles.time}>{lastMessageTime}</Text>
        {/* Number of unread messages */}
        <Text style={styles.unread}>{unread}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'gray',
    overflow: 'hidden',
    zIndex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    marginVertical: 0,
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
    color: 'grey',
    borderRadius: 5,
    padding: 1,
    fontSize: 14,
    alignSelf: 'flex-end',
  },
});

export default ChatObject;
