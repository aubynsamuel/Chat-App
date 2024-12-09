import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthContextProvider } from "../context/AuthContext";
import ExpoPushNotifications from "../services/ExpoPushNotifications";
import { ThemeContextProvider } from "../context/ThemeContext";
import { MenuProvider } from "react-native-popup-menu";

const RootLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(main)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="chatRoom" options={{ animation: "none" }} />
    </Stack>
  );
};

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

export default App;
