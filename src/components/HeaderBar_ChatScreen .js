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
  damping: 20,
  mass: 0.8,
  stiffness: 120,
  overshootClamping: false,
  restSpeedThreshold: 0.3,
  restDisplacementThreshold: 0.3,
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
      const shouldExpand = gestureProgress.value > 0.5 || velocity > 0.5;
      
      gestureProgress.value = withSpring(
        shouldExpand ? 1 : 0,
        {
          ...SPRING_CONFIG,
          velocity,
        },
      );
      
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
        [0, 1],
        [45, MAX_IMAGE_WIDTH],
        Extrapolate.CLAMP,
      ),
      SPRING_CONFIG,
    ),
    height: withSpring(
      interpolate(
        gestureProgress.value,
        [0, 1],
        [45, MAX_HEADER_HEIGHT],
        Extrapolate.CLAMP,
      ),
      SPRING_CONFIG,
    ),
    borderRadius: withSpring(
      interpolate(
        gestureProgress.value,
        [0, 1],
        [30, 0],
        Extrapolate.CLAMP,
      ),
      SPRING_CONFIG,
    ),
    transform: [
      {
        translateX: withSpring(
          interpolate(
            gestureProgress.value,
            [0, 1],
            [0, -10],
            Extrapolate.CLAMP,
          ),
          SPRING_CONFIG,
        ),
      },
      {
        translateY: withSpring(
          interpolate(
            gestureProgress.value,
            [0, 1],
            [0, 1],
            Extrapolate.CLAMP,
          ),
          SPRING_CONFIG,
        ),
      },
    ],
  }));

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: withTiming(
      interpolate(
        gestureProgress.value,
        [0, 0.3],
        [1, 0],
        Extrapolate.CLAMP,
      ),
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
                {isHeaderExpanded && (
                  <Animated.Text 
                    style={styles.titleOnTop} 
                    entering={FadeIn.duration(400)} 
                    exiting={FadeOut.duration(300)}
                  >
                    {title}
                  </Animated.Text>
                )}
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
    backgroundColor: "lightblue",
    opacity:0.9,
    position: 'absolute',
    top: -10,
    left: -10,
    width: '100%',
    padding: 10,
    color: 'white',
    fontSize: 22.5,
    fontWeight: '500',
    textAlign: 'center',
    zIndex:5,
    fontSize: 22.5,
    fontWeight: '500',
  },
});

export default TopHeaderBar;
