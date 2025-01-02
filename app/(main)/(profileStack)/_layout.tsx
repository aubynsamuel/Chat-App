import React from "react";
import { Stack } from "expo-router";
import { darkTheme, useTheme } from "../../../imports";
import { View } from "react-native";

const ProfileLayout = () => {
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
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="profile" />
        <Stack.Screen name="editProfile" />
      </Stack>
    </View>
  );
};

export default ProfileLayout;
