import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "../../../imports";

const HomeLayout = () => {
  const { selectedTheme } = useTheme();
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="home" />
        <Stack.Screen name="searchUsers" />
      </Stack>
    </SafeAreaProvider>
  );
};

export default HomeLayout;
