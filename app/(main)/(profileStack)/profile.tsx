import React, { useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  TouchableOpacity,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import UserProfileContent from "./userProfileContent";
import { useTheme, getStyles } from "../../../imports";

interface ThemeOption {
  id: string;
  color: string;
  name: string;
}

const UserProfileScreen: React.FC = () => {
  const { selectedTheme, changeTheme } = useTheme();
  const styles = getStyles(selectedTheme);

  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // snap points
  const snapPoints = useMemo(() => ["25%"], []);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const themes: ThemeOption[] = [
    { id: "0", color: "lightgreen", name: "Green Day" },
    { id: "1", color: "lightblue", name: "Sky Lander" },
    { id: "2", color: "black", name: "Dark Angel" },
    { id: "3", color: "purple", name: "Nothing Much" },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={selectedTheme.Statusbar.style as any} animated />
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
          backdropComponent={(props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
              {...props}
              disappearsOnIndex={-1}
              appearsOnIndex={0}
              opacity={0.5}
            />
          )}
        >
          <BottomSheetView style={stylesSheet.contentContainer as any}>
            <Text style={{ fontSize: 16, margin: 10 }}>
              Select Your Preferred Theme
            </Text>
            <ScrollView
              showsHorizontalScrollIndicator={false}
              horizontal
              contentContainerStyle={
                stylesSheet.flatListContentContainer as any
              }
            >
              {themes.map((item) => (
                <View key={item.id} style={stylesSheet.themeContainer as any}>
                  <TouchableOpacity
                    onPress={() => changeTheme(parseInt(item.id, 10))}
                    style={[
                      stylesSheet.colorBox as any,
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
