import React from "react";
import { useAuth, AuthContextProvider } from "../context/AuthContext";
import { ThemeContextProvider } from "../context/ThemeContext";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MenuProvider } from "react-native-popup-menu";
import ExpoPushNotifications from "../services/ExpoPushNotifications";
import Toast from "../components/ToastMessage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "../context/ThemeContext";

const App = () => {
  return (
    <GestureHandlerRootView>
      <AuthContextProvider>
        <ExpoPushNotifications>
          <ThemeContextProvider>
            <MenuProvider>
              <RootLayout />
            </MenuProvider>
          </ThemeContextProvider>
        </ExpoPushNotifications>
      </AuthContextProvider>
    </GestureHandlerRootView>
  );
};

const RootLayout = () => {
  const { selectedTheme } = useTheme();
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          navigationBarColor: selectedTheme.background,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="signUp" />
        <Stack.Screen name="login" />
        <Stack.Screen name="home" />
        <Stack.Screen name="searchUsers" />
        <Stack.Screen name="userProfile" />
        <Stack.Screen name="editProfile" />
        {/* <Stack.Screen name="intermediary" /> */}
        <Stack.Screen name="chatRoom"/>
      </Stack>
      <Toast />
    </SafeAreaProvider>
  );
};

export default App;
