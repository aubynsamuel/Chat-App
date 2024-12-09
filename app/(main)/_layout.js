import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

const TabLayout = () => {
  const { selectedTheme } = useTheme();

  // Shared value to track the current tab index
  const activeTabIndex = useSharedValue(0);

  // Separate shared value for smooth animation
  const animationProgress = useSharedValue(0);

  // Mapping of tab names to their indices
  const TAB_INDICES = {
    chat: 0,
    call: 1,
    person: 2,
  };

  const TabIcon = ({ name, focused, size = 28 }) => {
    // Determine the index for this specific tab
    const tabIndex = TAB_INDICES[name];

    // Animated style for the oval background
    const animatedOvalStyle = useAnimatedStyle(() => {
      // Calculate the translation based on the animation progress
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

    // Effect to update active tab index when focused
    useEffect(() => {
      if (focused) {
        // Smoothly animate to the new tab index
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
        tabBarBadge: 2,
      }}
    >
      <Tabs.Screen
        name="(homeStack)"
        options={{
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
