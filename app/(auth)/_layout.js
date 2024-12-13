import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "../../imports";


const AuthLayout = () => {
  const { selectedTheme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        navigationBarColor: selectedTheme.background,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signUp" />
    </Stack>
  );
};

export default AuthLayout;
