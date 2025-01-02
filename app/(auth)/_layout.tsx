import React from "react";
import { Stack } from "expo-router";
import { darkTheme, useTheme } from "../../imports";
import { View } from "react-native";

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
      <Stack
        screenOptions={{
          headerShown: false,
          navigationBarColor: selectedTheme.background,
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="signUp" />
        <Stack.Screen name="setUserDetails" />
      </Stack>
    </View>
  );
};

export default AuthLayout;
