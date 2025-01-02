import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { darkTheme, useTheme } from "../../../imports";
import { View } from "react-native";

const HomeLayout = () => {
  const { selectedTheme } = useTheme();
  return (
    <View
      style={
        {
          backgroundColor: selectedTheme === darkTheme ? "black" : null,
          flex: 1,
        } as any
      }
    >
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
    </View>
  );
};

export default HomeLayout;
