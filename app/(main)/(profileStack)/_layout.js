import React from "react";
import { Stack } from "expo-router";

const ProfileLayout = () => {
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
