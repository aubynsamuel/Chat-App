import {
  StyleSheet,
  SafeAreaView,
  View,
  StatusBar,
} from 'react-native';
import {useAuth} from '../AuthContext';
import TopHeaderBar from '../components/HeaderBar_HomeScreen';
import {useEffect, useState} from 'react';
import ChatList from '../components/ChatList';
import {getDocs, query, where} from 'firebase/firestore';
import {usersRef} from '../../firebaseConfig';

function HomeScreen({navigation}) {
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
    <SafeAreaView>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="lightblue"
        // animated={true}
      />
      <TopHeaderBar title={'Chats'} backButtonShown={false} />
      <View style={styles.container}>
        <ChatList users={users} />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#fff',
    padding: 10,
    marginTop: 10,
  },
});

export default HomeScreen;
