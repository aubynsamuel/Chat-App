import React from "react";
import { Tabs } from "expo-router";
import { darkTheme, useTheme } from "../../imports";
import CustomTabBar from "../../components/CustomTabBar";
import { View } from "react-native";

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
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
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
          options={{
            title: "Profile",
            tabBarLabel: "Profile",
            tabBarIcon: ({ focused }) =>
              focused ? "person" : "person-outline",
          }}
        />
      </Tabs>
    </View>
  );
};

export default TabLayout;
