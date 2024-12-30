import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
} from "react-native";
import React, { ReactNode, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { ExternalPathString, router } from "expo-router";
import { useTheme, getStyles, useAuth } from "../../../imports";

const UserProfileContent = ({ children }: { children: ReactNode }) => {
  const { user, logout, showToast } = useAuth();
  const profileUrl = user?.profileUrl;
  const [imageFailed, setImageFailed] = useState(false);
  const { selectedTheme, changeBackgroundPic } = useTheme();
  const styles = getStyles(selectedTheme);

  const [selected, setSelected] = useState<boolean>(true);
  const handleLogout = async () => {
    await logout();
    router.replace("/login" as ExternalPathString);
  };

  const selectImage = async () => {
    try {
      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

      if (response.canceled) {
        console.log("User cancelled image picker");
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0].uri;
        console.log("ImagePicker Selected: ", selectedImage);
        changeBackgroundPic(selectedImage);
        showToast("Background Picture Changed");
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      showToast("Failed to change background picture");
    }
  };
  return (
    <ScrollView style={styles.upContainer}>
      <StatusBar
        style={`${selectedTheme.Statusbar.style}` as any}
        animated={true}
      />
      {/* User Profile Info */}
      <View style={styles.upProfileContainer}>
        {imageFailed || profileUrl == "" ? (
          <Image
            style={styles.upAvatar}
            source={require("../../../myAssets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp")}
          />
        ) : (
          <Image
            style={styles.upAvatar}
            source={{ uri: profileUrl }}
            onError={() => setImageFailed(true)}
          />
        )}
        <Text style={styles.upUsername}>{user?.username || "User Name"}</Text>
      </View>

      {/* Options Section */}
      <View style={styles.upOptionsContainer}>
        {/* Edit profile */}
        <TouchableOpacity
          style={styles.upOption}
          onPress={() => router.navigate("/editProfile" as ExternalPathString)}
        >
          <MaterialIcons
            name="edit"
            size={25}
            color={selectedTheme.text.primary}
          />
          <Text style={styles.upOptionText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Notifications */}
        <View style={styles.upOption}>
          <MaterialIcons
            name="notifications"
            size={25}
            color={selectedTheme.text.primary}
          />
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.upOptionText}>Notifications</Text>
            <Switch
              value={selected}
              onValueChange={() => setSelected((prev) => !prev)}
              thumbColor={"white"}
              trackColor={{
                true: "white",
                false: "black",
              }}
              style={{
                marginLeft: 10,
              }}
            ></Switch>
          </View>
        </View>
        {/*Change background picture */}
        <TouchableOpacity style={styles.upOption} onPress={selectImage}>
          <MaterialIcons
            name="image-search"
            size={25}
            color={selectedTheme.text.primary}
          />
          <Text style={styles.upOptionText}>Background Picture</Text>
        </TouchableOpacity>

        {/* Change Theme */}
        {children}

        {/* Logout */}
        <TouchableOpacity style={styles.upOption} onPress={handleLogout}>
          <MaterialIcons
            name="logout"
            size={25}
            color={selectedTheme.text.primary}
          />
          <Text style={styles.upOptionText}>Logout</Text>
        </TouchableOpacity>
        <View style={{ paddingBottom: 30 }}></View>
      </View>
    </ScrollView>
  );
};

export default UserProfileContent;
