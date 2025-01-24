import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { darkTheme, useTheme } from "../../../imports";
import { View } from "react-native";
import HomeScreen from "./home";
import SearchUsersScreen from "./searchUsers";

const Stack = createNativeStackNavigator();

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
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="home" component={HomeScreen} />
          <Stack.Screen name="searchUsers" component={SearchUsersScreen} />
        </Stack.Navigator>
      </SafeAreaProvider>
    </View>
  );
};

export default HomeLayout;
