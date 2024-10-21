import {View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../AuthContext';
import {formatTimeWithoutSeconds} from '../../commons';

const ChatObject = ({room}) => {
  const navigation = useNavigation();
  const {user} = useAuth();

  const handlePress = () => {
    navigation.navigate('ChatScreen', {
      userId: room.otherParticipant.userId,
      username: room.otherParticipant.username,
      profileUrl: room.otherParticipant.profileUrl,
    });
  };

  return (
    <TouchableOpacity style={styles.chatBox} onPress={handlePress}>
      <View
        style={[styles.chatBox, {width: '82%', justifyContent: 'flex-start'}]}>
        {/* Avatar */}
        <View>
          <TouchableOpacity>
            {!room?.otherParticipant.profileUrl ? (
              <Image
                style={[styles.avatar]}
                source={require('../../assets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp')}
                transition={500}
              />
            ) : (
              <Image
                style={[styles.avatar]}
                source={{uri: room?.otherParticipant.profileUrl}}
                transition={500}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={{marginLeft: 8, width: '80%'}}>
          {/* Username */}
          <Text numberOfLines={1} style={styles.name}>
            {room?.otherParticipant.username}
          </Text>

          {/* Last message */}
          <Text numberOfLines={1} style={styles.lastMessage}>
            {room?.lastMessage.senderId === room?.otherParticipant.userId
              ? room?.lastMessage
              : `You: ${room?.lastMessage}`}
          </Text>
        </View>
      </View>

      <View>
        {/* Time of last message */}
        <Text style={styles.time}>
          {room?.lastMessageTimestamp !== undefined
            ? formatTimeWithoutSeconds(room?.lastMessageTimestamp)
            : ''}
        </Text>
        {/* Number of unread messages */}
        <Text style={styles.unread}>
          {(room?.unreadCount && room?.unreadCount[user?.userId]) || ''}
        </Text>
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
    color: 'red',
    borderRadius: 5,
    padding: 1,
    fontSize: 15,
    alignSelf: 'flex-end',
  },
});

export default ChatObject;
