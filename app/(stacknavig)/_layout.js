import React from "react";
import { AuthContextProvider } from "../../context/AuthContext";
import { ThemeContextProvider } from "../../context/ThemeContext";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MenuProvider } from "react-native-popup-menu";
import ExpoPushNotifications from "../../services/ExpoPushNotifications";
import Toast from "../../components/ToastMessage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "../../context/ThemeContext";

const RootLayout = () => {
  const { selectedTheme } = useTheme();
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          navigationBarColor: selectedTheme.primary,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="chatRoom" options={{ animation: "none" }} />
        <Stack.Screen name="searchUsers" />
      </Stack>
      <Toast />
    </SafeAreaProvider>
  );
};

export default RootLayout;
