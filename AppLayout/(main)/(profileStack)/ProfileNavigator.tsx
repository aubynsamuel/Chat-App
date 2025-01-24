import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { darkTheme, useTheme } from "../../../imports";
import { View } from "react-native";
import UserProfileScreen from "./profile";
import EditProfileScreen from "./editProfile";

const Stack = createNativeStackNavigator();
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
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="profile" component={UserProfileScreen} />
        <Stack.Screen name="editProfile" component={EditProfileScreen} />
      </Stack.Navigator>
    </View>
  );
};

export default ProfileLayout;
