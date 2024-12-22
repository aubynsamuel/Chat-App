import React from "react";
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { useAuth, useTheme } from "../../imports";

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
                backgroundColor: "white",
              },
            ]}
          />
        )}
      </View>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingTop: 5,
          paddingBottom: 10,
          backgroundColor: selectedTheme.primary,
        },
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
          tabBarBadge: unreadChats.length as any> 0 ? unreadChats.length as any : null,
          title: "Chats",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} size={25} name={"chat"} />
          ),
        }}
      />
      <Tabs.Screen
        name="(profileStack)"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name={"person"} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
