import React, { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
} from "react-native-reanimated";
import { darkTheme, useTheme } from "@/imports";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs/src/types";
import { useUnreadChatsStore } from "@/context/UnreadChatStore";

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const { width } = Dimensions.get("window");
  const { selectedTheme } = useTheme();
  const unreadChats = useUnreadChatsStore((state) => state.unreadChats);

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
    <View
      style={[
        styles.container,
        {
          backgroundColor: selectedTheme.background,
          borderTopColor: selectedTheme === darkTheme ? "#252525" : "#E5E5EA",
        },
      ]}
    >
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
              backgroundColor:
                selectedTheme === darkTheme
                  ? selectedTheme.primary
                  : selectedTheme.surface,
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
            ? options.tabBarIcon({ focused: isFocused } as any)
            : options.tabBarIcon;

        const animatedIconStyle = useAnimatedStyle(() => {
          const scale = interpolate(
            translateX.value,
            [
              (width / visibleRoutes.length) * (index - 1),
              (width / visibleRoutes.length) * index,
              (width / visibleRoutes.length) * (index + 1),
            ],
            [0.9, 1, 0.9],
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
              {options.tabBarLabel === "Chats" && unreadChats.length > 0 && (
                <View
                  style={{
                    position: "absolute",
                    backgroundColor: "red",
                    left: 15,
                    top: -8,
                    zIndex: 5,
                    borderRadius: 50,
                    paddingHorizontal: 8,
                    flex: 1,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: 14,
                    }}
                  >
                    {unreadChats.length}
                  </Text>
                </View>
              )}
              <MaterialIcons
                name={iconName as any}
                size={26}
                color={
                  selectedTheme === darkTheme
                    ? "white"
                    : isFocused
                    ? selectedTheme.primary
                    : selectedTheme.surface
                }
              />
            </Animated.View>
            <Text
              style={[
                styles.label,
                {
                  color:
                    selectedTheme === darkTheme
                      ? "white"
                      : isFocused
                      ? selectedTheme.secondary
                      : selectedTheme.surface,
                },
              ]}
            >
              {label as any}
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
    borderTopWidth: 1,
    position: "relative",
    paddingVertical: 3,
  },
  indicator: {
    position: "absolute",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    zIndex: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
  },
});

export default CustomTabBar;
