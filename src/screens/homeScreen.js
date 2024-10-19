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

function HomeScreen() {
  const navigation = useNavigation();
  const {user} = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user?.uid) getUsers();
  }, [user]);

  const getUsers = async () => {
    const q = query(usersRef, where('userId', '!=', user?.uid));
    const querySnapshot = await getDocs(q);
    let data = [];
    querySnapshot.forEach(doc => {
      data.push({...doc.data()});
    });
    setUsers(data);
  };
  console.log(users);

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="lightblue"
        animated={true}
      />

      <TopHeaderBar title={'Chats'} backButtonShown={false} />

      <View style={styles.container}>
        <ChatList users={users} />
      </View>

      {/* Start conversation floating button at the button right */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={()=>navigation.navigate('Search_Users')}>
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
