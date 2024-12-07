import { React } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/homeScreen";
import EditProfileScreen from "../screens/edithProfileScreen";
import ChatScreen from "../screens/chatRoom";
import SignUpScreen from "../screens/signUpScreen";
import LoginScreen from "../screens/loginScreen";
import { useAuth } from "../AuthContext";
import { View } from "react-native";
import userProfileScreen from "../screens/userProfileScreen";
import SearchUsersScreen from "../screens/searchUsersScreen";
import LottieView from "lottie-react-native";
import { useTheme } from "../ThemeContext";
import IntermediaryScreen from "../screens/intermidiaryScreen";

const Stack = createStackNavigator();

const Navigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { selectedTheme } = useTheme();

  if (isLoading) {
    // Loading screen
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: selectedTheme.background,
        }}
      >
        <LottieView
          source={require("../../myAssets/Lottie_Files/send.json")}
          autoPlay
          loop={false}
          style={{
            flex: 0.8,
            width: 90 * 6.5,
            height: 90 * 6.5,
            alignSelf: "center",
          }}
        />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? "Home" : "Login"}
      screenOptions={{ headerShown: false, animationEnabled: false }}
    >
      <Stack.Screen name="Sign Up" component={SignUpScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Search_Users" component={SearchUsersScreen} />
      <Stack.Screen name="UserProfile" component={userProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Inter" component={IntermediaryScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen}/>
    </Stack.Navigator>
  );
};

export default Navigator;
