import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MenuProvider } from "react-native-popup-menu";
import Toast from "@/components/Toast";
import {
  AuthContextProvider,
  darkTheme,
  ExpoPushNotifications,
  ThemeContextProvider,
  useTheme,
} from "./imports";
import { LogBox, View } from "react-native";
import { useAudioManager } from "@/Functions/AudioCacheManager";
import AuthLayout from "./AppLayout/(auth)/AuthNavigator";
import ChatRoomWithContext from "./AppLayout/chatRoom";
import Index from "./AppLayout";
import TabLayout from "./AppLayout/(main)/TabLayout";
import { NavigationContainer } from "@react-navigation/native";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import backgroundListener, { backgroundListenerFireBase } from "./background";
// import TestNotification from "./components/TestNotification";

const Stack = createNativeStackNavigator();

const RootLayout = () => {
  const { selectedTheme } = useTheme();
  changeNavigationBarColor(selectedTheme.background);
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
      <Stack.Navigator
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          component={Index}
          options={
            {
              // navigationBarColor: selectedTheme.background,
            }
          }
        />
        <Stack.Screen name="(auth)" component={AuthLayout} />
        <Stack.Screen
          name="(main)"
          component={TabLayout}
          options={
            {
              // navigationBarColor: selectedTheme.background,
            }
          }
        />
        <Stack.Screen
          name="chatRoom"
          component={ChatRoomWithContext}
          options={{
            animation: "none",
            // navigationBarColor: selectedTheme.background,
          }}
        />
      </Stack.Navigator>
      <Toast />
    </View>
  );
};

const App = () => {
  const { getAudioCacheInstance } = useAudioManager();
  useEffect(() => {
    getAudioCacheInstance();
  }, []);
  return (
    <NavigationContainer>
      <ExpoPushNotifications>
        <GestureHandlerRootView>
          <ThemeContextProvider>
            <AuthContextProvider>
              <MenuProvider>
                <RootLayout />
              </MenuProvider>
            </AuthContextProvider>
          </ThemeContextProvider>
        </GestureHandlerRootView>
      </ExpoPushNotifications>
      {/* <TestNotification /> */}
    </NavigationContainer>
  );
};

export default App;

backgroundListener;
backgroundListenerFireBase;
