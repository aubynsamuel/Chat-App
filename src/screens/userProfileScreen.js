import React, { useCallback, useMemo, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  TouchableOpacity,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import UserProfileContent from "./userProfileScreenContent";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import getStyles from "./sreen_Styles";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import { ScrollView } from "react-native-gesture-handler";

const UserProfileScreen = () => {
  const { selectedTheme, changeTheme } = useTheme();
  const styles = getStyles(selectedTheme);
  // ref
  const bottomSheetModalRef = useRef(null);

  // snap points
  const snapPoints = useMemo(() => ["25%"], []);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
    changeNavigationBarColor("lightgrey", false, true);
  }, []);

  const handleSheetChanges = useCallback((index) => {
    console.log("handleSheetChanges", index);
  }, []);

  const themes = [
    { id: "0", color: "lightgreen", name: "Green Day" },
    { id: "1", color: "lightblue", name: "Sky Lander" },
    { id: "2", color: "black", name: "Dark Angel" },
    { id: "3", color: "purple", name: "Nothing Much" },
  ];

  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <UserProfileContent>
          <TouchableOpacity
            onPress={handlePresentModalPress}
            style={styles.upOption}
          >
            <MaterialIcons
              name="palette"
              size={25}
              color={selectedTheme.text.primary}
            />
            <Text style={styles.upOptionText}>Change Theme</Text>
          </TouchableOpacity>
        </UserProfileContent>
        <BottomSheetModal
          maxDynamicContentSize={250}
          ref={bottomSheetModalRef}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          backgroundStyle={{ backgroundColor: "lightgrey" }}
          onDismiss={() =>
            changeNavigationBarColor(selectedTheme.background, false, true)
          }
          backdropComponent={(props) => (
            <BottomSheetBackdrop
              {...props}
              disappearsOnIndex={-1}
              appearsOnIndex={0}
              opacity={0.5}
            />
          )}
        >
          <BottomSheetView style={stylesSheet.contentContainer}>
            <Text style={{ fontSize: 16, margin: 10 }}>
              Select Your Preferred Theme
            </Text>
            <ScrollView
              showsHorizontalScrollIndicator={false}
              horizontal={true}
              contentContainerStyle={stylesSheet.flatListContentContainer}
            >
              {themes.map((item) => (
                <View key={item.id} style={stylesSheet.themeContainer}>
                  <TouchableOpacity
                    onPress={() => changeTheme(parseInt(item.id))}
                    style={[
                      stylesSheet.colorBox,
                      { backgroundColor: item.color },
                    ]}
                  />
                  <Text>{item.name}</Text>
                </View>
              ))}
            </ScrollView>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const stylesSheet = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
    backgroundColor: "lightgrey",
    flexDirection: "column",
    justifyContent: "space-evenly",
  },

  colorBox: {
    width: 90,
    height: 90,
    borderRadius: 100,
    marginBottom: 10,
    elevation: 4,
  },
  themeContainer: {
    alignItems: "center",
    marginHorizontal: 15,
    marginBottom: 10,
  },
  flatListContentContainer: {
    flexDirection: "row",
  },
});

export default UserProfileScreen;
