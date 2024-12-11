import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthContextProvider } from "../context/AuthContext";
import ExpoPushNotifications from "../services/ExpoPushNotifications";
import { ThemeContextProvider } from "../context/ThemeContext";
import { MenuProvider } from "react-native-popup-menu";
import { Toast } from "au-react-native-toast";

const RootLayout = () => {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="chatRoom" options={{ animation: "none" }} />
      </Stack>
      <Toast />
    </>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView>
      <ThemeContextProvider>
        <AuthContextProvider>
          <ExpoPushNotifications>
            <MenuProvider>
              <RootLayout />
            </MenuProvider>
          </ExpoPushNotifications>
        </AuthContextProvider>
      </ThemeContextProvider>
    </GestureHandlerRootView>
  );
};

export default App;
