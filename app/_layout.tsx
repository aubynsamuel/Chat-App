import React from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
import { Toast } from "au-react-native-toast";
import {
  AuthContextProvider,
  darkTheme,
  ExpoPushNotifications,
  ThemeContextProvider,
  useTheme,
} from "../imports";
import { LogBox, View } from "react-native";

const RootLayout = () => {
  const { selectedTheme } = useTheme();
  LogBox.ignoreAllLogs();
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
        initialRouteName="index"
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
        <Stack.Screen
          name="(main)"
          options={{
            navigationBarColor: selectedTheme.background,
          }}
        />
        <Stack.Screen
          name="chatRoom"
          options={{
            animation: "none",
            navigationBarColor: selectedTheme.background,
          }}
        />
      </Stack>
      <Toast />
    </View>
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
