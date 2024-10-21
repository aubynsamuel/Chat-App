import {
  StyleSheet,
  SafeAreaView,
  View,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {useAuth} from '../AuthContext';
import TopHeaderBar from '../components/HeaderBar_HomeScreen';
import {useEffect, useState} from 'react';
import ChatList from '../components/ChatList';
import {
  getDocs,
  query,
  where,
  orderBy,
  collection,
  doc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import {usersRef, db} from '../../firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function HomeScreen() {
  const navigation = useNavigation();
  const {user} = useAuth();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      initializeRooms();
    }
  }, [user]);

  const initializeRooms = async () => {
    setIsLoading(true);
    try {
      // First load from cache
      const cachedRooms = await loadCachedRooms();
      if (cachedRooms) {
        setRooms(cachedRooms);
      }

      // Then subscribe to real-time updates
      subscribeToRooms();
    } catch (error) {
      console.error('Error initializing rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCachedRooms = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(`rooms_${user.uid}`);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      return null;
    } catch (error) {
      console.error('Error loading rooms from cache:', error);
      return null;
    }
  };

  const subscribeToRooms = () => {
    const roomsRef = collection(db, 'rooms');
    const roomsQuery = query(
      roomsRef,
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTimestamp', 'desc'),
    );

    return onSnapshot(roomsQuery, async snapshot => {
      const roomsData = [];

      for (const roomDoc of snapshot.docs) {
        const roomData = roomDoc.data();
        const otherUserId = roomData.participants.find(id => id !== user.uid);

        if (otherUserId) {
          const userDocRef = doc(usersRef, otherUserId);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            roomsData.push({
              roomId: roomDoc.id,
              lastMessage: roomData?.lastMessage,
              lastMessageTimestamp: roomData?.lastMessageTimestamp,
              lastMessageSenderId: roomData?.lastMessageSenderId,
              otherParticipant: {
                userId: otherUserId,
                username: userData.username,
                profileUrl: userData.profileUrl,
              },
            });
          }
        }
      }
      if (roomsData.length > 0) {
        setRooms(roomsData);
        await AsyncStorage.setItem(
          `rooms_${user.uid}`,
          JSON.stringify(roomsData),
        );
      }
    });
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="lightblue"
        animated={true}
      />

      <TopHeaderBar title={'Chats'} backButtonShown={false} />

      <View style={styles.container}>
        <ChatList
          rooms={rooms}
          isLoading={isLoading}
          onRefresh={initializeRooms}
        />
      </View>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('Search_Users')}>
        <Icon name="add-circle" size={30} color="lightblue" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginTop: 10,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: '#5385F7',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
