import {React, useState} from 'react';
import {Text, TouchableOpacity, View, StyleSheet, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Menu, MenuOptions, MenuTrigger} from 'react-native-popup-menu';

const TopHeaderBar = ({title, backButtonShown, profileUrl}) => {
  const navigation = useNavigation();
  const [imageFailed, setImageFailed] = useState(false);

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
            {(imageFailed || profileUrl == '' || profileUrl == null) ? (
              <Image
                style={{width: 45, height: 45, borderRadius: 30}}
                source={require('../../assets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp')}
                transition={500}
              />
            ) : (
              <Image
                style={{width: 45, height: 45, borderRadius: 30}}
                source={{uri: profileUrl}}
                transition={500}
                onError={() => setImageFailed(true)}
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
            }}></MenuOptions>
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
    fontSize: 22.5,
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
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    // borderColor: 'gray',
    // overflow: 'hidden',
    // zIndex: 1,
  },
});
export default TopHeaderBar;
