import React from "react";
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { useAuth, useTheme } from "../../imports";
import CustomTabBar from "../../components/CustomTabBar";

const TabLayout = () => {
  const { selectedTheme } = useTheme();
  const { unreadChats } = useAuth();

  const TabIcon = ({
    name,
    focused,
    size = 28,
  }: {
    name: any;
    focused: boolean;
    size?: number;
  }) => (
    <View style={{ alignItems: "center" }}>
      <MaterialIcons name={name} size={size} color={"black"} />
      <View style={{ position: "absolute" }}>
        {focused && (
          <View
            style={[
              {
                zIndex: -1,
                height: 20,
                width: 55,
                top: 10,
                alignSelf: "center",
                position: "absolute",
                borderRadius: 100,
                backgroundColor: selectedTheme.primary,
              },
            ]}
          />
        )}
      </View>
    </View>
  );

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // tabBarStyle: {
        //   height: 60,
        //   marginTop: 50,
        //   // paddingBottom: 10,
        //   // backgroundColor: selectedTheme.primary,
        //   borderTopWidth: 1,
        // },
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
          tabBarBadge:
            (unreadChats.length as any) > 0
              ? (unreadChats.length as any)
              : null,
          title: "Chats",
          tabBarLabel: "Chats",
          tabBarIcon: ({ focused }) => "chat",
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
          tabBarIcon: ({ focused }) => (focused ? "person" : "person-outline"),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
