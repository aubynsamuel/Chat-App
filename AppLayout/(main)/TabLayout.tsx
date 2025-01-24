import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { darkTheme, useTheme } from "../../imports";
import CustomTabBar from "../../components/CustomTabBar";
import { View } from "react-native";
import HomeLayout from "./(homeStack)/HomeNavigator";
import ProfileLayout from "./(profileStack)/ProfileNavigator";

const Tabs = createBottomTabNavigator();

const TabLayout = () => {
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
      <Tabs.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          tabBarHideOnKeyboard: true,
          headerShown: false,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "bold",
            color: selectedTheme.text.primary,
          },
        }}
      >
        <Tabs.Screen
          name="(homeStack)"
          component={HomeLayout}
          options={{
            title: "Chats",
            tabBarLabel: "Chats",
            tabBarIcon: () => "chat",
          }}
        />
        {/* <Tabs.Screen
        name="calls"
        options={{
          title: "Calls",
          tabBarLabel: "Calls",
          tabBarIcon: ({ focused }) => "call",
        }}
      /> */}
        <Tabs.Screen
          name="(profileStack)"
          component={ProfileLayout}
          options={{
            title: "Profile",
            tabBarLabel: "Profile",
            tabBarIcon: ({ focused }) =>
              focused ? "person" : "person-outline",
          }}
        />
      </Tabs.Navigator>
    </View>
  );
};

export default TabLayout;
