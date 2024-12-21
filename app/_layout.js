import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
import { Toast } from "au-react-native-toast";
import {
  AuthContextProvider,
  ExpoPushNotifications,
  ThemeContextProvider,
  useTheme,
  useAuth,
} from "../imports";
import ScreenOverlay from "../components/ScreenOverlay";
import { LogBox } from "react-native";
import { ChatProvider } from "../context/ChatContext";

const RootLayout = () => {
  const { selectedTheme } = useTheme();
  const { gettingLocationOverlay } = useAuth();
  return (
    <>
      {LogBox.ignoreAllLogs()}
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            navigationBarColor: selectedTheme.background,
          }}
        />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen
          name="chatRoom"
          options={{
            animation: "none",
            navigationBarColor: selectedTheme.background,
          }}
        />
      </Stack>
      <Toast />
      {/* Loading spinner */}
      {gettingLocationOverlay && <ScreenOverlay title={"Getting your location"} />}
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
              <ChatProvider>
                <RootLayout />
              </ChatProvider>
            </MenuProvider>
          </ExpoPushNotifications>
        </AuthContextProvider>
      </ThemeContextProvider>
    </GestureHandlerRootView>
  );
};

export default App;
