import React, {useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Menu, MenuOptions, MenuTrigger} from 'react-native-popup-menu';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useAnimatedGestureHandler,
  runOnJS,
  FadeIn,
  FadeOut,
  withTiming,
} from 'react-native-reanimated';
import {PanGestureHandler} from 'react-native-gesture-handler';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const {width: IMAGE_WIDTH} = Dimensions.get('window');
const MAX_IMAGE_WIDTH = IMAGE_WIDTH;

const MAX_HEADER_HEIGHT = SCREEN_HEIGHT * 0.6;
const MIN_HEADER_HEIGHT = 65;

// Spring configuration for smoother animations
const SPRING_CONFIG = {
  damping: 30/1.5, // Increase damping for less bounciness
  mass: 1/1.5,
  stiffness: 150*1.5,
  overshootClamping: true, // Prevent overshooting the target
  restSpeedThreshold: 0.1, // Adjust thresholds for quicker settling
  restDisplacementThreshold: 0.1,
};

const FADE_CONFIG = {
  duration: 300,
};

const TopHeaderBar = ({title, backButtonShown, profileUrl}) => {
  const navigation = useNavigation();
  const [imageFailed, setImageFailed] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);

  const gestureProgress = useSharedValue(0);

  const onGestureEvent = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startY = gestureProgress.value;
    },
    onActive: (event, context) => {
      const progress = context.startY + event.translationY / MAX_HEADER_HEIGHT;
      gestureProgress.value = Math.max(0, Math.min(1, progress));
    },
    onEnd: event => {
      const velocity = event.velocityY / 1000;
      const shouldExpand = gestureProgress.value > 0.9 || velocity > 0.9;

      gestureProgress.value = withSpring(shouldExpand ? 1 : 0, {
        ...SPRING_CONFIG,
        velocity,
      });

      runOnJS(setIsHeaderExpanded)(shouldExpand);
    },
  });

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    height: withSpring(
      interpolate(
        gestureProgress.value,
        [0, 1],
        [MIN_HEADER_HEIGHT, MAX_HEADER_HEIGHT],
        Extrapolate.CLAMP,
      ),
      SPRING_CONFIG,
    ),
  }));

  const animatedImageStyle = useAnimatedStyle(() => ({
    width: withSpring(
      interpolate(
        gestureProgress.value,
        [
          0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
          0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1,
        ],
        [
          45,
          MAX_IMAGE_WIDTH / 20,
          MAX_IMAGE_WIDTH / 19,
          MAX_IMAGE_WIDTH / 18,
          MAX_IMAGE_WIDTH / 17,
          MAX_IMAGE_WIDTH / 16,
          MAX_IMAGE_WIDTH / 15,
          MAX_IMAGE_WIDTH / 14,
          MAX_IMAGE_WIDTH / 13,
          MAX_IMAGE_WIDTH / 12,
          MAX_IMAGE_WIDTH / 11,
          MAX_IMAGE_WIDTH / 10,
          MAX_IMAGE_WIDTH / 9,
          MAX_IMAGE_WIDTH / 8,
          MAX_IMAGE_WIDTH / 7,
          MAX_IMAGE_WIDTH / 6,
          MAX_IMAGE_WIDTH / 5,
          MAX_IMAGE_WIDTH / 4,
          MAX_IMAGE_WIDTH / 3,
          MAX_IMAGE_WIDTH / 2,
          MAX_IMAGE_WIDTH,
        ],
        Extrapolate.CLAMP,
      ),
      // SPRING_CONFIG,
    ),
    height: withSpring(
      interpolate(
        gestureProgress.value,
        [
          0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6,
          0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1,
        ],
        [
          45,
          MAX_HEADER_HEIGHT / 20,
          MAX_HEADER_HEIGHT / 19,
          MAX_HEADER_HEIGHT / 18,
          MAX_HEADER_HEIGHT / 17,
          MAX_HEADER_HEIGHT / 16,
          MAX_HEADER_HEIGHT / 15,
          MAX_HEADER_HEIGHT / 14,
          MAX_HEADER_HEIGHT / 13,
          MAX_HEADER_HEIGHT / 12,
          MAX_HEADER_HEIGHT / 11,
          MAX_HEADER_HEIGHT / 10,
          MAX_HEADER_HEIGHT / 9,
          MAX_HEADER_HEIGHT / 8,
          MAX_HEADER_HEIGHT / 7,
          MAX_HEADER_HEIGHT / 6,
          MAX_HEADER_HEIGHT / 5,
          MAX_HEADER_HEIGHT / 4,
          MAX_HEADER_HEIGHT / 3,
          MAX_HEADER_HEIGHT / 2,
          MAX_HEADER_HEIGHT,
        ],
        Extrapolate.CLAMP,
      ),
      // SPRING_CONFIG,
    ),
    borderRadius: withSpring(
      interpolate(
        gestureProgress.value,
        [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        [30, 25.5, 21, 16.5, 12, 7.5, 3, -1.5, -6, -10.5, 0],
        Extrapolate.CLAMP,
      ),
      SPRING_CONFIG,
    ),
    transform: [
      {
        translateX: withSpring(
          interpolate(
            gestureProgress.value,
            [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
            [0, -0.5, -1, -1.5, -2, -2.5, -3, -3.5, -4, -4.5, -5, -5.5, -6, -6.5, -7, -7.5, -8, -8.5, -9, -9.5, -10],
            
            Extrapolate.CLAMP,
          ),
          SPRING_CONFIG,
        ),
      },
      {
        translateY: withSpring(
          interpolate(
            gestureProgress.value,
           [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
           [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1],
           
            Extrapolate.CLAMP,
          ),
          SPRING_CONFIG,
        ),
      },
    ],
  }));

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: withTiming(
      interpolate(gestureProgress.value, [0, 0.3], [1, 0], Extrapolate.CLAMP),
      FADE_CONFIG,
    ),
    transform: [
      {
        translateY: withSpring(
          interpolate(
            gestureProgress.value,
            [0, 1],
            [0, -50],
            Extrapolate.CLAMP,
          ),
          SPRING_CONFIG,
        ),
      },
    ],
  }));

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
        {backButtonShown && !isHeaderExpanded && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon
              name="arrow-back"
              style={styles.headerBarIcon}
              color={'black'}
              size={25}
            />
          </TouchableOpacity>
        )}

        {isHeaderExpanded ? (
          <View></View>
        ) : (
          <Animated.Text style={[styles.headerTitle, animatedTitleStyle]}>
            {title}
          </Animated.Text>
        )}

        <View style={styles.profileContainer}>
          <Menu>
            <MenuTrigger>
              <View>
                {/* {isHeaderExpanded && (
                  <Animated.Text
                    style={styles.titleOnTop}
                    entering={FadeIn.duration(100)}
                    exiting={FadeOut.duration(100)}>
                    {title}
                  </Animated.Text>
                )} */}
                {imageFailed || !profileUrl ? (
                  <Animated.Image
                    style={[styles.avatar, animatedImageStyle]}
                    source={require('../../assets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp')}
                  />
                ) : (
                  <Animated.Image
                    style={[styles.avatar, animatedImageStyle]}
                    source={{uri: profileUrl}}
                    onError={() => setImageFailed(true)}
                  />
                )}
              </View>
            </MenuTrigger>
            <MenuOptions
              style={styles.container}
              customStyles={{
                optionsContainer: styles.menuOptionsContainer,
              }}
            />
          </Menu>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    backgroundColor: 'lightblue',
    elevation: 10,
    justifyContent: 'space-between',
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: 22.5,
    fontWeight: '500',
    marginHorizontal: 10,
    color: 'black',
  },
  headerBarIcon: {
    marginHorizontal: 10,
  },
  container: {
    backgroundColor: 'lightblue',
    elevation: 10,
  },
  menuText: {
    fontSize: 15,
    margin: 8,
    color: 'black',
  },
  avatar: {
    height: 45,
    width: 45,
    borderRadius: 30,
  },
  profileContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1,
    // backgroundColor:"red",
  },
  menuOptionsContainer: {
    elevation: 5,
    borderRadius: 10,
    borderCurve: 'circular',
    marginTop: 40,
    marginLeft: -30,
  },
  titleOnTop: {
    backgroundColor: 'lightblue',
    opacity: 0.9,
    position: 'absolute',
    top: -10,
    left: -10,
    width: '100%',
    padding: 10,
    color: 'white',
    fontSize: 22.5,
    fontWeight: '500',
    textAlign: 'center',
    zIndex: 5,
    fontSize: 22.5,
    fontWeight: '500',
  },
});

export default TopHeaderBar;
