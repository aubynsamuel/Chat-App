import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar
} from 'react-native';
import React, {useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import {TextInput} from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../AuthContext';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const email = useRef('');
  const username = useRef('');
  const password = useRef('');
  const pictureUrl = useRef('');
  const {signUp} = useAuth();

  // Email regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password regex created to ensure password strength (at least 8 characters, including a number and a special character)
  const passwordStrengthRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

  const handleSignUpPressed = async () => {
    if (!email.current || !username.current || !password.current) {
      Alert.alert('Sign Up', 'Please enter your email, username, and password.');
      return;
    }

    // Email format validation
    if (!emailRegex.test(email.current)) {
      Alert.alert('Sign Up', 'Please enter a valid email address.');
      return;
    }

    // Password strength validation
    if (!passwordStrengthRegex.test(password.current)) {
      Alert.alert('Sign Up', 'Password must be at least 8 characters long and include a number and a special character.');
      return;
    }

    try {
      let response = await signUp(
        email.current,
        username.current,
        password.current,
        pictureUrl.current
      );
      console.log(response);

      if (!response.success && !response.msg.includes('Missing or insufficient permissions')) {
        Alert.alert('Sign Up Failed', response.msg || 'An unexpected error occurred.');
        return;
      }

      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Sign Up Error', 'An error occurred during sign up. Please try again later.');
    }
  };

  return (
    <SafeAreaView>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f3f3f3"
      />
      <Text style={styles.loginText}>Sign Up</Text>

      {/* Input Fields */}
      <View style={styles.form}>
        <View style={styles.InputField}>
          <Icon name="email" color="black" size={25} />
          <TextInput
            placeholder="Email"
            style={styles.inputText}
            placeholderTextColor={'grey'}
            onChangeText={value => (email.current = value)}
          />
        </View>
        <View style={styles.InputField}>
          <Icon name="person" color="black" size={25} />
          <TextInput
            placeholder="Username"
            style={styles.inputText}
            placeholderTextColor={'grey'}
            onChangeText={value => (username.current = value)}
          />
        </View>
        <View style={styles.InputField}>
          <Icon name="lock" color="black" size={25} />
          <TextInput
            placeholder="Password"
            secureTextEntry={true}
            style={styles.inputText}
            placeholderTextColor={'grey'}
            onChangeText={value => (password.current = value)}
          />
        </View>

        <View style={styles.InputField}>
          <Icon name="image" color="black" size={25} />
          <TextInput
            placeholder="Picture Url"
            style={styles.inputText}
            placeholderTextColor={'grey'}
            onChangeText={value => (pictureUrl.current = value)}
          />
        </View>

        <TouchableOpacity
          style={styles.signUp}
          onPress={handleSignUpPressed}
        >
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
        
        <View style={{flexDirection: 'row', alignSelf: 'center'}}>
          <Text style={styles.registerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.registerButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// create a style sheet

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    alignSelf: 'center',
    color: 'black',
  },
  form: {
    width: wp('80%'),
    alignSelf: 'center',
  },
  InputField: {
    marginBottom: 10,
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
  signUp: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    width: wp('80%'),
    alignSelf: 'center',
  },
  signUpText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerText: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  registerButtonText: {
    marginTop: 5,
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
