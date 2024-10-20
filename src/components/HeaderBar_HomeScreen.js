import {React, useState} from 'react';
import {Text, TouchableOpacity, View, StyleSheet, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../AuthContext';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

const TopHeaderBar = ({title, backButtonShown}) => {
  const navigation = useNavigation();
  const {user, logout} = useAuth();
  const [imageFailedToLoad, setImageFailedToLoad] = useState(false);

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
  };
  // Fetch user profile picture when component mounts

  return (
    <View style={styles.headerContainer}>
      {/* Back Button */}
      {backButtonShown && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-back"
            style={styles.headerBarIcon}
            color={'black'}
            size={25}
          />
        </TouchableOpacity>
      )}

      {/* HeaderTitle */}
      <Text style={styles.headerTitle}>{title}</Text>

      {/* User Profile Picture */}
      <View>
        <Menu>
          <MenuTrigger>
            {(imageFailedToLoad || user?.profileUrl == '') ? (
              <Image
                source={require('../../assets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp')}
                style={{width: 45, height: 45, borderRadius: 30}}
                transition={500}
              />
            ) : (
              <Image
                source={{uri: user?.profileUrl}}
                style={{width: 45, height: 45, borderRadius: 30}}
                transition={500}
                onError={error => {
                  console.error('Error loading image:', error);
                  setImageFailedToLoad(true);
                }}
              />
            )}
          </MenuTrigger>
          <MenuOptions
            style={styles.container}
            customStyles={{
              optionsContainer: {
                elevation: 5,
                borderRadius: 10,
                borderCurve: 'circular',
                marginTop: 40,
                marginLeft: -30,
              },
            }}>
              {/* Profile */}
            <MenuOption
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onSelect={() => {
                navigation.navigate('UserProfile');
              }}>
              <Text style={styles.menuText}>Profile</Text>
              <Icon name="person" color="black" size={25} />
            </MenuOption>

            {/* Logout */}
            <MenuOption
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onSelect={() => {
                handleLogout();
              }}>
              <Text style={styles.menuText}>Sign Out</Text>
              <Icon name="logout" color="black" size={25} />
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
    </View>
  );
};

// create a style sheet

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'lightblue',
    elevation: 10,
    height: 65,
    justifyContent: 'space-between',
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '500',
    marginHorizontal: 10,
    color: 'black',
  },
  headerBarIcon: {
    marginHorizontal: 10,
  },
  container: {
    backgroundColor: 'lightblue',
    elevation: 10,
  },
  menuText: {
    fontSize: 15,
    margin: 8,
    color: 'black',
  },
});
export default TopHeaderBar;
