import {React} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../AuthContext';
import {
  Menu,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';

const TopHeaderBar = ({title, backButtonShown, profileUrl}) => {
  const navigation = useNavigation();
  const {user, logout} = useAuth();
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
          <Icon name="arrow-back" style={styles.headerBarIcon} color={"black"} size={25} />
        </TouchableOpacity>
      )}

      {/* HeaderTitle */}
      <Text style={styles.headerTitle}>{title}</Text>

      {/* User Profile Picture */}
      <View>
        <Menu>
          <MenuTrigger>
            <Image
              source={
                user?.profileUrl
                  ? {uri: profileUrl}
                  : require('../../assets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp')
              }
              style={{width: 45, height: 45, borderRadius: 30}}
              transition={500}
              onError={error => console.error('Error loading image:', error)}
            />
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
            {/* <MenuOption
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onSelect={() => {}}>
              <Text style={styles.menuText}>Profile</Text>
              <Icon name="person" color="black" size={25} />
            </MenuOption>

            <MenuOption
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onSelect={() => {handleLogout()}}>
              <Text style={styles.menuText}>Sign Out</Text>
              <Icon name="logout" color="black" size={25} />
            </MenuOption> */}
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
    // alignItems:"flex-end",
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,

    // borderBottomWidth: 1.5,
    // borderBottomColor: '#0003',
    // paddingTop: Platform.OS === 'android' ? 5 : 0,
  },
  headerTitle: {
    fontSize: 22.5,
    fontWeight: '500',
    marginHorizontal: 10,
    color: 'black',
  },
  headerBarIcon: {
    // color: isDarkMode ? colors.bgLightColor : colors.accent,
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
