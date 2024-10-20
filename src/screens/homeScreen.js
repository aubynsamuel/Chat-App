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
} from 'firebase/firestore';
import {usersRef, db} from '../../firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getRoomId} from '../../commons';

function HomeScreen() {
  const navigation = useNavigation();
  const {user} = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      initializeUsers();
    }
  }, [user]);

  const initializeUsers = async () => {
    setIsLoading(true);
    try {
      // First load from cache
      const cachedUsers = await loadCachedUsers();
      if (cachedUsers) {
        setUsers(cachedUsers);
      }

      // Then try to fetch fresh data
      await getUsers();
    } catch (error) {
      console.error('Error initializing users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCachedUsers = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(`users_${user.uid}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        console.log('Successfully loaded users from cache');
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error('Error loading users from cache:', error);
      return null;
    }
  };

  const getUsers = async () => {
    try {
      // Step 1: Query the `rooms` collection to get rooms where the current user is a participant
      const roomsRef = collection(db, 'rooms');
      const roomsQuery = query(
        roomsRef,
        where('participants', 'array-contains', user.uid), // Switch to using participants array instead
        orderBy('createdAt', 'desc'),
      );

      const roomSnapshot = await getDocs(roomsQuery);
      let userData = [];

      // Step 3: Iterate through the rooms and extract other user IDs
      for (let roomDoc of roomSnapshot.docs) {
        const roomData = roomDoc.data();

        // Get the other userId from the participants array
        const otherUserId = roomData.participants?.find(id => id !== user.uid);

        if (!otherUserId) {
          console.warn(`No other participant found in room: ${roomDoc.id}`);
          continue;
        }

        // Step 4: Fetch the user data for the other user in the room
        const userDocRef = doc(usersRef, otherUserId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          userData.push({
            ...userDoc.data(),
            lastCommunication: roomData.createdAt,
          });
        } else {
          console.warn(`User document not found for ID: ${otherUserId}`);
        }
      }

      // Cache and update users state
      if (userData.length > 0) {
        setUsers(userData);
        await AsyncStorage.setItem(
          `users_${user.uid}`,
          JSON.stringify(userData),
        );
        console.log('Successfully fetched and cached users from Firebase');
      }
    } catch (error) {
      console.error('Error fetching users from Firebase:', error);
      // Keep cached data if Firebase query fails
    }
  };
  // Clear cache #TODO
  const deleteCache = async () => {
    try {
      await AsyncStorage.removeItem(`users_${user.uid}`);
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
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
          users={users}
          isLoading={isLoading}
          onRefresh={initializeUsers}
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
