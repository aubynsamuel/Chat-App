import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useAuth, useTheme } from "../../imports";

const TabLayout = () => {
  const { selectedTheme } = useTheme();
  const { unreadChats } = useAuth();

  const activeTabIndex = useSharedValue(0);

  const animationProgress = useSharedValue(0);

  const TAB_INDICES = {
    chat: 0,
    call: 1,
    person: 2,
  };

  const TabIcon = ({ name, focused, size = 28 }) => {
    const tabIndex = TAB_INDICES[name];

    const animatedOvalStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        animationProgress.value,
        [
          activeTabIndex.value - 1,
          activeTabIndex.value,
          activeTabIndex.value + 1,
        ],
        [-55, 0, 55],
        Extrapolation.CLAMP
      );

      return {
        transform: [
          {
            translateX: withSpring(focused ? 0 : translateX, {
              damping: 8,
              stiffness: 50,
              mass: 1,
              overshootClamping: false,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 0.01,
            }),
          },
        ],
      };
    }, [focused, tabIndex]);

    useEffect(() => {
      if (focused) {
        animationProgress.value = withTiming(tabIndex, { duration: 300 });
        activeTabIndex.value = tabIndex;
      }
    }, [focused, tabIndex]);

    return (
      <View style={{ alignItems: "center" }}>
        <MaterialIcons name={name} size={size} color={"black"} />
        <View style={{ position: "absolute" }}>
          {focused && (
            <Animated.View
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
                animatedOvalStyle,
              ]}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        navigationBarColor: selectedTheme.primary,
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
          tabBarBadge: unreadChats.length > 0 ? unreadChats.length : null,
          title: "Chats",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} size={25} name={"chat"} />
          ),
        }}
      />
      <Tabs.Screen
        name="calls"
        options={{
          title: "Calls",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} name={"call"} />
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
