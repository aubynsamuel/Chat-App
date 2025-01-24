import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { darkTheme, useTheme } from "../../imports";
import { View } from "react-native";
import LoginScreen from "./login";
import SignUpScreen from "./signUp";
import SetUserDetailsScreen from "./setUserDetails";

const Stack = createNativeStackNavigator();

const AuthLayout = () => {
  const { selectedTheme } = useTheme();
  return (
    <View
      style={
        {
          backgroundColor: selectedTheme === darkTheme ? "black" : null,
          flex: 1,
        } as any
      }
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          // navigationBarColor: selectedTheme.background,
        }}
      >
        <Stack.Screen name="login" component={LoginScreen} />
        <Stack.Screen name="signUp" component={SignUpScreen} />
        <Stack.Screen name="setUserDetails" component={SetUserDetailsScreen} />
      </Stack.Navigator>
    </View>
  );
};

export default AuthLayout;
