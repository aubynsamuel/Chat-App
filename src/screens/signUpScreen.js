import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {TextInput} from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuth} from '../AuthContext';
import LottieView from 'lottie-react-native';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const email = useRef('');
  const username = useRef('');
  const password = useRef('');
  const pictureUrl = useRef('');
  const {signUp} = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUpPressed = async () => {
    setIsLoading(true);
    if (!email.current || !username.current || !password.current) {
      Alert.alert('Sign Up', 'Please enter your email, username and password');
      setIsLoading(false);
      return;
    }
    let response = await signUp(
      email.current,
      username.current,
      password.current,
      pictureUrl.current,
    );
    console.log(response);
    if (
      !response.success &&
      !response.msg.includes('Missing or insufficient permissions')
    ) {
      Alert.alert('Sign Up', response.msg);
      setIsLoading(false);
      return;
    }
    navigation.navigate('Home');
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f3f3f3"
        animated={true}
      />

      <LottieView
        source={require('../../assets/Lottie_Files/Sign Up.json')}
        autoPlay
        loop={true}
        style={{flex: 0.8, left: 10}}
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
            placeholder="username"
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
          onPress={() => {
            handleSignUpPressed();
          }}>
          {isLoading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Text style={styles.signUpText}>Sign Up</Text>
          )}
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
  forgotPasswordText: {
    fontSize: 15,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
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
