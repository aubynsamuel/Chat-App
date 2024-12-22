import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "../../../imports";

const ProfileLayout = () => {
  const { selectedTheme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        navigationBarColor: selectedTheme.primary,
      }}
    >
      <Stack.Screen name="profile" />
      <Stack.Screen name="editProfile" />
    </Stack>
  );
};

export default ProfileLayout;
