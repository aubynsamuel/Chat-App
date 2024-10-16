import {View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../AuthContext';
import {useEffect, useState} from 'react';
import {formatTimeWithoutSeconds} from '../../commons'

const ChatObject = ({users, unread}) => {
  const navigation = useNavigation();
  const {lastMessage} = useAuth();

  const [lastMessageTime, setLastMessageTime] = useState('');

  useEffect(() => {
    if (lastMessage) {
      setLastMessageTime(formatTimeWithoutSeconds(lastMessage.createdAt));
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
              ? `You: ${lastMessage?.content}`
              : lastMessage?.content}
          </Text>
        </View>
      </View>

      <View>
        {/* Time of last message */}
        <Text style={styles.time}>

            {lastMessageTime}
        </Text>
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
    // backgroundColor:"red",
    alignSelf: 'flex-end',

  },
  unread: {
    // backgroundColor: 'blue',
    color: 'grey',
    borderRadius: 5,
    padding: 1,
    fontSize: 14,
    alignSelf: 'flex-end',
  },
});

export default ChatObject;
