import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "../../../imports";

const ProfileLayout = () => {
  const { selectedTheme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="profile" />
      <Stack.Screen name="editProfile" />
    </Stack>
  );
};

export default ProfileLayout;
