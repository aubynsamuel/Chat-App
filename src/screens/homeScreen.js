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
import {getDocs, query, where} from 'firebase/firestore';
import {usersRef} from '../../firebaseConfig';
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
      // Fetch users excluding the current user and those in the current user's active chats
      const q = query(usersRef, where('userId', '!=', user?.userId));
      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id, // Include document ID for better data management
      }));

      // Only update state and cache if we actually got new data
      if (data.length > 0) {
        setUsers(data);
        await AsyncStorage.setItem(`users_${user.uid}`, JSON.stringify(data));
        console.log('Successfully fetched and cached users from Firebase');
      }
    } catch (error) {
      console.error('Error fetching users from Firebase:', error);
      // Don't throw the error - we already have cached data displayed
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
