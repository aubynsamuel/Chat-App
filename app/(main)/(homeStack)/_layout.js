import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "../../../components/ToastMessage";
import { useTheme } from "../../../context/ThemeContext";

const HomeLayout = () => {
  const { selectedTheme } = useTheme();
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          navigationBarColor: selectedTheme.primary,
        }}
      >
        <Stack.Screen name="home" />
        <Stack.Screen name="searchUsers" />
      </Stack>
      <Toast />
    </SafeAreaProvider>
  );
};

export default HomeLayout;
