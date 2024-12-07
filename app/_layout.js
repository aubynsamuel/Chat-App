import React from "react";
import { useAuth, AuthContextProvider } from "../src/AuthContext";
import { ThemeContextProvider } from "../src/ThemeContext";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MenuProvider } from "react-native-popup-menu";
import ExpoPushNotifications from "../src/services/ExpoPushNotifications";
import Toast from "../src/components/ToastMessage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "../src/ThemeContext";

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
  const { toastMessage } = useAuth();
  const { selectedTheme } = useTheme();
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animationEnabled: false,
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
        <Stack.Screen name="intermediary" />
        <Stack.Screen name="chatRoom" />
      </Stack>
      <Toast message={toastMessage} duration={2500} />
    </SafeAreaProvider>
  );
};

export default App;
