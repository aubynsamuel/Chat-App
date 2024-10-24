import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {useAuth} from '../AuthContext';
import {useNavigation} from '@react-navigation/native';
import {TextInput} from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';

const LoginScreen = () => {
  const {login, resetPassword} = useAuth();
  const email = useRef('');
  const password = useRef('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordReveal, setPasswordReveal] = useState(true);
  const [color, setColor] = useState('black');

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!email.current) {
      Alert.alert('Forgot Password', 'Please enter your email address');
      return;
    }

    const response = await resetPassword(email.current);
    if (response.success) {
      Alert.alert(
        'Password Reset',
        'A password reset link has been sent to your email address',
      );
    } else {
      Alert.alert('Password Reset Error', response.msg);
      console.log(response);
    }
  };

  const handleLoginPressed = async () => {
    setIsLoading(true);
    if (!email.current || !password.current) {
      Alert.alert('Login', 'Please enter your email and password');
      setIsLoading(false);
      return;
    }
    const response = await login(email.current, password.current);
    if (!response.success) {
      Alert.alert('Login', response.msg);
      console.log(response);
      setIsLoading(false);
      return;
    }
    navigation.navigate('Home');
    setIsLoading(false);
  };

  const navigation = useNavigation();
  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f3f3f3"
        animated={true}
      />
      <LottieView
        source={require('../../assets/Lottie_Files/Online Chat.json')}
        autoPlay
        loop={true}
        style={{
          flex: 0.8,
          width: 90 * 6.5,
          height: 90 * 6.5,
          alignSelf: 'center',
        }}
      />
      {/* background image */}

      <Text style={styles.loginText}>Login</Text>

      {/* Input Fields */}
      <View style={styles.form}>
        {/* Email */}
        <View style={styles.InputField}>
          <Icon name="email" color="black" size={25} />
          <TextInput
            placeholder="Email"
            style={styles.inputText}
            placeholderTextColor={'grey'}
            onChangeText={value => (email.current = value)}
          />
        </View>

        {/* Password */}
        {/* Password */}
        <View style={styles.InputField}>
          <Icon name="lock" color="black" size={25} />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              flex: 1,
              alignItems: 'center',
            }}>
            <TextInput
              placeholder="Password"
              secureTextEntry={passwordReveal}
              style={styles.inputText}
              placeholderTextColor={'grey'}
              onChangeText={value => (password.current = value)}
            />
            <TouchableOpacity
              onPress={() => {
                setPasswordReveal(prev => !prev);
                setColor(passwordReveal ? 'grey' : 'black');
              }}>
              <Icon name="remove-red-eye" color={color} size={25} />
            </TouchableOpacity>
          </View>
        </View>

        {/* forgot password */}
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => {
            handleLoginPressed();
          }}>
          {isLoading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
        <View style={{flexDirection: 'row', alignSelf: 'center'}}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Sign Up')}>
            <Text style={styles.registerButtonText}>Register</Text>
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
    backgroundColor: '#F5FCFF',
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
  loginButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    width: wp('80%'),
    alignSelf: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  forgotPasswordText: {
    fontSize: 15,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    color: '#4CAF50',
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

export default LoginScreen;
