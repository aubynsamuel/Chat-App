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

const ChatScreen = () => {
  const route = useRoute();
  const {userId, username, profileUrl} = route.params;
  const {user, setLastMsg} = useAuth();
  const [messages, setMessages] = useState([]);
  const textRef = useRef('');
  const flatListRef = useRef(null);
  const inputRef = useRef(null);


  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      setLastMsg(lastMessage);
      console.log(lastMessage, "from ChatScreen")
    }
  }, [messages]);

  useEffect(() => {
    flatListRef.current.scrollToEnd({animated: true});
  }, [messages]);

  useEffect(() => {
    const roomId = getRoomId(user.userId, userId);
    createRoomIfItDoesNotExist(roomId);
    const docRef = doc(db, 'rooms', roomId);
    const messagesRef = collection(docRef, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    let unsubscribe = onSnapshot(q, snapshot => {
      let allMessages = snapshot.docs.map(doc => {
        return doc.data();
      });
      setMessages([...allMessages]);
    });

    return unsubscribe;
  }, []);

  const createRoomIfItDoesNotExist = async roomId => {
    await setDoc(doc(db, 'rooms', roomId), {
      roomId,
      createdAt: getCurrentTime(),
    });
  };

  const handleSend = async () => {
    const message = textRef.current.trim();
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
      textRef.current = '';
      if (inputRef.current) inputRef.current.clear();
      // console.log('Messages', messages);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderItem = ({item}) => {
    const isUserMessage = item.senderId === user?.userId;
    const messageStyle = isUserMessage
      ? styles.userMessage
      : styles.otherMessage;
    const imageStyle = isUserMessage ? styles.userImage : styles.otherImage;

    if (item.type === 'text') {
      return (
        <View
          style={
            isUserMessage
              ? styles.userMessageContainer
              : styles.otherMessageContainer
          }>
          <Text style={messageStyle}>{item.content}</Text>
          {/* <Text style={isUserMessage ? styles.userTime : styles.otherTime}>
            {formatTimeWithoutSeconds(item.createdAt)}
          </Text> */}
        </View>
      );
    } else if (item.type === 'image') {
      return <Image source={{uri: item.content}} style={imageStyle} />;
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
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
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
    paddingTop: 10,
    justifyContent: 'flex-end',
  },
  messages: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    // padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 10,
    borderRadius: 10,
  },
  textInputField: {
    // borderWidth: 1,
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
  imagePickerText: {
    color: '#fff',
    fontSize: 24,
  },
  userMessage: {
    backgroundColor: 'lightgrey',
    // borderRadius: 7,
    // marginVertical: 5,
    // alignSelf: 'flex-end',
    // padding: 8,
    fontSize: 16,
    color: '#000',
  },
  otherMessage: {
    backgroundColor: '#c8ecee',
    // borderRadius: 7,
    // marginVertical: 5,
    // alignSelf: 'flex-start',
    // padding: 8,
    fontSize: 16,
    color: '#000',
  },
  // userImage: {
  //   width: 200,
  //   height: 200,
  //   borderRadius: 10,
  //   marginVertical: 5,
  //   alignSelf: 'flex-end',
  // },
  // otherImage: {
  //   width: 200,
  //   height: 200,
  //   borderRadius: 10,
  //   marginVertical: 5,
  //   alignSelf: 'flex-start',

  // },
  userTime: {
    fontSize: 12,
    color: 'grey',
    alignSelf: 'flex-start',
    // bottom: 5,
  },
  otherTime: {
    fontSize: 12,
    color: 'grey',
    alignSelf: 'flex-end',
    // bottom: 5,
  },
  userMessageContainer: {
    backgroundColor: 'lightgrey',
    borderRadius: 7,
    marginVertical: 5,
    alignSelf: 'flex-end',
    maxWidth: '80%',
    padding: 8,
  },
  otherMessageContainer: {
    backgroundColor: '#c8ecee',
    borderRadius: 7,
    marginVertical: 5,
    alignSelf: 'flex-start',
    maxWidth: '80%',
    padding: 8,
  },
});

export default ChatScreen;
