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
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const RootLayout = () => {
  const { selectedTheme } = useTheme();
  const { loadingIndicator } = useAuth();
  return (
    <>
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
      {loadingIndicator && (
        <View style={styles.loadingSpinnerContainer}>
          <ActivityIndicator
            size={"large"}
            color={"white"}
            style={{ zIndex: 1 }}
          />
          <Text
            style={{
              zIndex: 1,
              fontSize: 18,
              textAlign: "center",
              color: "white",
              fontWeight: "semibold",
            }}
          >
            Getting your location
          </Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loadingSpinnerContainer: {
    position: "absolute",
    zIndex: 10,
    justifyContent: "center",
    alignSelf: "center",
    top: 65,
    bottom: 0,
    paddingBottom: 190,
    width: "100%",
    height: "100%",
    backgroundColor: "#0005",
  },
});

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
