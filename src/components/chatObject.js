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
  where,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatObject = ({users}) => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const [lastMessage, setLastMessage] = useState(null); // Updated to null for better handling
  const [lastMessageTime, setLastMessageTime] = useState('');
  const [imageFailedToLoad, setImageFailedToLoad] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);


  // helper to initialize useEffect to start listening to firestore
  const cachedMessages = AsyncStorage.getItem(`lastMessage_${users.userId}`);

  useEffect(() => {
    const roomId = getRoomId(user?.userId, users.userId);
    const docRef = doc(db, 'rooms', roomId);
    const messagesRef = collection(docRef, 'messages');
  
    const q = query(messagesRef, where('senderId', '==', users.userId), where('read', '==', false));
    
    const unsubscribe = onSnapshot(q, snapshot => {
      setUnreadCount(snapshot.docs.length);
      console.log(unreadCount)
    });
  
    return unsubscribe;
  }, []);

  useEffect(() => {
    const roomId = getRoomId(user?.userId, users.userId);
    const docRef = doc(db, 'rooms', roomId);
    const messagesRef = collection(docRef, 'messages');

    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));

    let unsubscribe = onSnapshot(q, snapshot => {
      if (!snapshot.empty) {
        const lastMessageData = snapshot.docs[0].data();
        setLastMessage(lastMessageData); 
        console.log(lastMessage)
      } else {
        setLastMessage(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (lastMessage && lastMessage.createdAt) {
      setLastMessageTime(formatTimeWithoutSeconds(lastMessage.createdAt));
      console.log(lastMessageTime)
    } else {
      setLastMessageTime(''); 
    }
  }, []);

  const handlePress = () => {
    setUnreadCount(0); // Reset unread count when navigating to the chat screen
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
            {imageFailedToLoad ? (
              <Image
                style={[styles.avatar]}
                source={require('../../assets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp')}
                transition={500}
              />
            ) : (
              <Image
                style={[styles.avatar]}
                source={{uri: users.profileUrl}}
                transition={500}
                onError={error => {
                  console.error('Error loading image:', error);
                  setImageFailedToLoad(true);
                }}
              />
            )}
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
        <Text style={styles.unread}>{unreadCount > 0 ? unreadCount : ''}</Text>
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
    // borderWidth: 2,
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
