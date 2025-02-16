import React, { useCallback, useMemo, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
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
import { useTheme, getStyles, darkTheme } from "../../../imports";
import { activeTouchableOpacity } from "@/Functions/Constants";

interface ThemeOption {
  id: string;
  color: string;
  name: string;
}

const UserProfileScreen = () => {
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
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={selectedTheme.Statusbar.style as any} animated />
      <BottomSheetModalProvider>
        <UserProfileContent>
          <TouchableOpacity
            activeOpacity={activeTouchableOpacity}
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
          backgroundStyle={{
            backgroundColor:
              selectedTheme === darkTheme ? selectedTheme.background : "white",
          }}
          handleIndicatorStyle={{
            backgroundColor:
              selectedTheme === darkTheme ? "lightgrey" : "black",
          }}
          backdropComponent={(props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
              {...props}
              disappearsOnIndex={-1}
              appearsOnIndex={0}
              opacity={0.5}
            />
          )}
        >
          <BottomSheetView
            style={[
              stylesSheet.contentContainer as any,
              {
                backgroundColor:
                  selectedTheme === darkTheme
                    ? selectedTheme.background
                    : "white",
              },
            ]}
          >
            <Text
              style={{
                fontSize: 16,
                margin: 10,
                color: selectedTheme === darkTheme ? "lightgrey" : "black",
              }}
            >
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
                    activeOpacity={activeTouchableOpacity}
                    onPress={() => changeTheme(parseInt(item.id, 10))}
                    style={[
                      stylesSheet.colorBox as any,
                      {
                        borderWidth:
                          item.id === "2" && selectedTheme === darkTheme
                            ? 10
                            : null,
                        borderColor:
                          item.id === "2" && selectedTheme === darkTheme
                            ? "white"
                            : null,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                  <Text
                    style={{
                      color:
                        selectedTheme === darkTheme ? "lightgrey" : "black",
                    }}
                  >
                    {item.name}
                  </Text>
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
