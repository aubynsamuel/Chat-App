import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  SafeAreaView, 
  View, 
  TextInput, 
  FlatList, 
  Text, 
  TouchableOpacity,
  StatusBar 
} from 'react-native';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const SearchUsersScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  const handleSearch = async (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredUsers([]); 
      return;
    }

    try {
      const usersRef = collection(db, 'users'); 
      const q = query(usersRef, where('username', '!=', user?.username), where('username', '>=', text), where('username', '<=', text + '\uf8ff'));
      const querySnapshot = await getDocs(q);

      const userData = [];
      querySnapshot.forEach(doc => {
        userData.push({ ...doc.data() });
      });
      setFilteredUsers(userData);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleUserPress = (selectedUser) => {
    navigation.navigate('ChatScreen', {
      userId: selectedUser.userId,
      username: selectedUser.username,
      profileUrl: selectedUser.profileUrl,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="lightblue" />
      <View style={styles.header}>
        <Icon name="arrow-back" size={25} color="black" onPress={() => navigation.goBack()} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="grey" 
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.userId} 
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(item)}>
            <Text style={styles.username}>{item.username}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.noResults}>No users found</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'lightblue',
  },
  searchInput: {
    marginLeft: 10,
    padding: 8,
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    fontSize: 16,
    color:"black"
  },
  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  username: {
    fontSize: 18,
    color: '#333',
  },
  noResults: {
    padding: 20,
    textAlign: 'center',
    color: 'gray',
    fontSize: 16,
  },
});

export default SearchUsersScreen;
