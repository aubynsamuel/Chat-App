import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Switch,
} from 'react-native';
import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../AuthContext'; 

const UserProfileScreen = () => {
  const {user, logout} = useAuth(); 
  const navigation = useNavigation();
  const profileUrl = user?.profileUrl;
  const handleLogout = async () => {
    await logout();
    navigation.navigate('Login');
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f9f9f9"
        animated={true}
      />
      {/* back icon */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={25} color="black" />
      </TouchableOpacity>
      {/* User Profile Info */}
      <View style={styles.profileContainer}>
        <Image
          source={profileUrl? {uri: profileUrl} : require('../../assets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp')}
          style={styles.avatar}
        />
        <Text style={styles.username}>{user?.username || 'User Name'}</Text>
      </View>

      {/* Options Section */}
      <View style={styles.optionsContainer}>

        {/* Edit profile */}
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('EditProfile')}>
          <Icon name="edit" size={25} color="black" />
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Notifications */}
        <View style={styles.option}>
          <Icon name="notifications" size={25} color="black" />
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'space-between',
            }}>
            <Text style={styles.optionText}>Notifications</Text>
            <Switch value={true}
              trackColor={{false: '#767577', true: '#313236'}}
              style={{
                marginLeft: 10,
              }}></Switch>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Icon name="logout" size={25} color="black" />
          <Text style={styles.optionText}>Logout</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 15,
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    height: 150,
    width: 150,
    borderRadius: 100,
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: 'black',
    marginVertical: 5,
  },
  optionsContainer: {
    marginVertical: 15,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
  },
});

export default UserProfileScreen;
