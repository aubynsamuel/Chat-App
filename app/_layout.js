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
import LoadingIndicator from "../components/LoadingIndicator";
import { LogBox } from "react-native";

const RootLayout = () => {
  const { selectedTheme } = useTheme();
  const { loadingIndicator } = useAuth();
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
      {loadingIndicator && <LoadingIndicator title={"Getting your location"} />}
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
