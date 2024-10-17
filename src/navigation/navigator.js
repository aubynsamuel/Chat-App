import {React} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screens/homeScreen';
import SettingsScreen from '../screens/settingsScreen';
import ChatScreen from '../screens/chatRoom';
import SignUpScreen from '../screens/signUpScreen';
import LoginScreen from '../screens/loginScreen';
import {useAuth} from '../AuthContext';
import {ActivityIndicator, View} from 'react-native';

const Stack = createStackNavigator();

const Navigator = () => {
  const {isAuthenticated} = useAuth();

  if (isAuthenticated === undefined) {
    // Loading screen
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color="#0000ff"></ActivityIndicator>
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'Home' : 'Login'}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Sign Up" component={SignUpScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
    </Stack.Navigator>
  );
};

export default Navigator;
