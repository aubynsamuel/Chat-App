import React, { memo, useState } from "react";
import { TouchableOpacity, View, Dimensions, Keyboard } from "react-native";
import { Menu, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import getStyles from "../styles/Component_Styles";
import { Theme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

const TopHeaderBar = memo(
  ({
    title,
    profileUrl,
    theme,
  }: {
    title: string;
    profileUrl: string;
    theme: Theme;
  }) => {
    const navigation = useNavigation();
    const [imageFailed, setImageFailed] = useState(false);
    const styles = getStyles(theme);
    const contextY = useSharedValue(0);
    const AnimatedTouchableOpacity =
      Animated.createAnimatedComponent(TouchableOpacity);
    const { height: SCREEN_HEIGHT } = Dimensions.get("window");
    const { width: IMAGE_WIDTH } = Dimensions.get("window");
    const MAX_IMAGE_WIDTH = IMAGE_WIDTH;

    const MAX_HEADER_HEIGHT = SCREEN_HEIGHT * 0.6;
    const MIN_HEADER_HEIGHT = 55;

    const gestureProgress = useSharedValue(0);

    const onGestureEvent = Gesture.Pan()
      .onStart(() => {
        contextY.value = gestureProgress.value;
      })
      .onUpdate((event) => {
        const progress =
          contextY.value + event.translationY / MAX_HEADER_HEIGHT;
        gestureProgress.value = Math.max(0, Math.min(1, progress));
      })
      .onEnd((event) => {
        const velocity = event.velocityY / 1000;
        const shouldExpand = gestureProgress.value > 0.5 || velocity > 0.5;
        gestureProgress.value = withTiming(shouldExpand ? 1 : 0, {
          duration: 300,
        });
      });

    const animatedHeaderStyle = useAnimatedStyle(() => ({
      height: interpolate(
        gestureProgress.value,
        [0, 1],
        [MIN_HEADER_HEIGHT, MAX_HEADER_HEIGHT]
      ),
    }));

    const animatedImageStyle = useAnimatedStyle(() => ({
      width: interpolate(gestureProgress.value, [0, 1], [45, MAX_IMAGE_WIDTH]),
      height: interpolate(
        gestureProgress.value,
        [0, 1],
        [45, MAX_HEADER_HEIGHT]
      ),
      borderRadius: interpolate(gestureProgress.value, [0, 1], [30, 0]),
    }));

    const animatedImageContainerStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: interpolate(gestureProgress.value, [0, 1], [0, 10]),
        },
      ],
    }));

    const animatedTitleStyle = useAnimatedStyle(() => ({
      opacity: interpolate(gestureProgress.value, [0, 0.4, 1], [1, 0, 0]),
    }));

    const animatedButtonStyle = useAnimatedStyle(() => ({
      opacity: interpolate(gestureProgress.value, [0, 0.4, 1], [1, 0, 0]),
    }));

    return (
      <GestureDetector gesture={onGestureEvent}>
        <Animated.View style={[styles.hcHeaderContainer, animatedHeaderStyle]}>
          {/* Back Button */}
          <Animated.View style={animatedButtonStyle}>
            <AnimatedTouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                navigation.goBack();
              }}
            >
              <MaterialIcons
                name="arrow-back"
                style={styles.hcHeaderBarIcon}
                color={theme.text.primary}
                size={24}
              />
            </AnimatedTouchableOpacity>
          </Animated.View>

          {/* Header Title */}
          <Animated.View>
            <Animated.Text style={[styles.hcHeaderTitle, animatedTitleStyle]}>
              {title}
            </Animated.Text>
          </Animated.View>

          {/* Profile Image */}
          <View style={styles.hcProfileContainer}>
            <Menu>
              <MenuTrigger>
                <View>
                  {imageFailed || !profileUrl ? (
                    <Animated.View style={[animatedImageContainerStyle]}>
                      <Animated.Image
                        style={[styles.hcAvatar, animatedImageStyle]}
                        source={require("../myAssets/Images/profile-picture-placeholder.webp")}
                      />
                    </Animated.View>
                  ) : (
                    <Animated.View style={[animatedImageContainerStyle]}>
                      <Animated.Image
                        style={[styles.hcAvatar, animatedImageStyle]}
                        source={{ uri: profileUrl }}
                        onError={() => setImageFailed(true)}
                      />
                    </Animated.View>
                  )}
                </View>
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionsContainer: styles.hcMenuOptionsContainer,
                }}
              />
            </Menu>
          </View>
        </Animated.View>
      </GestureDetector>
    );
  }
);

export default TopHeaderBar;
