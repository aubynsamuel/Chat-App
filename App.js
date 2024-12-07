import React from "react";
import { AuthContextProvider, useAuth } from "./src/AuthContext";
import Navigator from "./src/navigation/navigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { MenuProvider } from "react-native-popup-menu";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import ExpoPushNotifications from "./src/services/ExpoPushNotifications";
import { View } from "react-native";
import ThemeContextProvider from "./src/ThemeContext";
import { LogBox } from "react-native";
import { useTheme } from "./src/ThemeContext";
import DarkMode from "./src/Themes/DarkMode";
import Toast from "./src/components/ToastMessage";

const App = () => {
  return (
      <AuthContextProvider>
          <ExpoPushNotifications>
            <ThemeContextProvider>
              <MenuProvider>
                <SafeAreaProvider>
                  <AppContent />
                </SafeAreaProvider>
              </MenuProvider>
            </ThemeContextProvider>
          </ExpoPushNotifications>
      </AuthContextProvider>
  );
};

const AppContent = () => {
  LogBox.ignoreAllLogs(); // Ignore all logs
  const { isAuthenticated, toastMessage} = useAuth();
  const { selectedTheme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: selectedTheme.background,
      }}
    >
      <NavigationContainer
        theme={selectedTheme === DarkMode ? DarkTheme : DefaultTheme}
      >
        {console.log("isAuthenticated", isAuthenticated)}
        <Navigator />
        {changeNavigationBarColor(selectedTheme.background)}
        <Toast message={toastMessage} duration={2500} />
      </NavigationContainer>
    </View>
  );
};

export default App;
