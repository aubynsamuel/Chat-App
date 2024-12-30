import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "@/imports";

const { width } = Dimensions.get("window");

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { selectedTheme } = useTheme();
  // Filter out system routes
  const visibleRoutes = state.routes.filter(
    (route) => !route.name.startsWith("_") && !route.name.startsWith("+")
  );

  const translateX = useSharedValue(0);

  useEffect(() => {
    const visibleIndex = visibleRoutes.findIndex(
      (route) => route.key === state.routes[state.index].key
    );
    translateX.value = (width / visibleRoutes.length) * visibleIndex;
  }, [state.index]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: withSpring(translateX.value, { duration: 800 }) },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.indicator,
          indicatorStyle,
          { width: width / visibleRoutes.length },
        ]}
      >
        <View
          style={[
            {
              zIndex: -1,
              height: 32,
              width: 60,
              top: 8,
              alignSelf: "center",
              position: "absolute",
              borderRadius: 100,
              backgroundColor: selectedTheme.surface,
            },
          ]}
        ></View>
      </Animated.View>
      {visibleRoutes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? route.name;
        const isFocused =
          state.index === state.routes.findIndex((r) => r.key === route.key);

        const iconName =
          typeof options.tabBarIcon === "function"
            ? options.tabBarIcon({ focused: isFocused })
            : options.tabBarIcon;

        const animatedIconStyle = useAnimatedStyle(() => {
          const scale = interpolate(
            translateX.value,
            [
              (width / visibleRoutes.length) * (index - 1),
              (width / visibleRoutes.length) * index,
              (width / visibleRoutes.length) * (index + 1),
            ],
            [0.8, 1, 0.8],
            "clamp"
          );

          return {
            transform: [{ scale: withSpring(scale) }],
          };
        });

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
          >
            <Animated.View style={animatedIconStyle}>
              <MaterialIcons
                name={iconName}
                size={26}
                color={
                  isFocused ? selectedTheme.primary : selectedTheme.surface
                }
              />
            </Animated.View>
            <Text
              style={[
                styles.label,
                {
                  color: isFocused
                    ? selectedTheme.secondary
                    : selectedTheme.surface,
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 60,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    position: "relative",
    paddingVertical: 3,
    // alignItems: "center",
  },
  indicator: {
    position: "absolute",
    // height: 20,
    // borderRadius: 50,
    // backgroundColor: "#000000",
    // top: -20,
  },
  tab: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    zIndex: 2,
  },
  label: {
    fontSize: 13,
    // marginTop: 4,
    fontWeight: "500",
  },
});

export default CustomTabBar;
