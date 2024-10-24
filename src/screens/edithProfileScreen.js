import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../AuthContext';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';

const EditProfileScreen = () => {
  const {user, updateProfile} = useAuth(); // Assuming `updateProfile` is a function from `useAuth` to save user changes
  const [username, setUsername] = useState(user.username || '');
  const [profileUrl, setProfileUrl] = useState(user.profileUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  // Handle image selection
  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.7,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0].uri;
        setProfileUrl(selectedImage);
      }
    });
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    setIsLoading(true);

    if (!username) {
      Alert.alert('Profile Update', 'Username cannot be empty');
      setIsLoading(false);
      return;
    }

    try {
      const response = await updateProfile({
        username,
        profileUrl,
      });

      if (!response.success) {
        Alert.alert('Error', response.msg);
        setIsLoading(false);
        return;
      }

      Alert.alert('Profile Update', 'Profile updated successfully!');
      setIsLoading(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Profile Update', 'Failed to update profile');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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

      <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
        {/* Profile Picture */}
        <TouchableOpacity onPress={selectImage}>
          {profileUrl ? (
            <Image source={{uri: profileUrl}} style={styles.profileImage} />
          ) : (
            <Image
              source={require('../../assets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp')}
              style={styles.profileImage}
            />
          )}
          <Text style={styles.changePicText}>Change Profile Picture</Text>
        </TouchableOpacity>

        {/* Username */}
        <View style={styles.InputField}>
          <Icon name="person" color="black" size={25} />
          <TextInput
            placeholder="Username"
            style={styles.inputText}
            placeholderTextColor={'grey'}
            value={username}
            onChangeText={setUsername}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleUpdateProfile}>
          {isLoading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    alignSelf: 'center',
  },
  changePicText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  InputField: {
    marginBottom: 20,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: hp('6%'),
    width: wp('80%'),
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
    color: 'black',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    width: wp('80%'),
    alignSelf: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EditProfileScreen;
