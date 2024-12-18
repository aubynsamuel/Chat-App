import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
} from "react-native";
import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useTheme, getStyles, useAuth } from "../../../imports";

const UserProfileContent = ({ children }) => {
  const { user, logout, showToast } = useAuth();
  const profileUrl = user?.profileUrl;
  const [imageFailed, setImageFailed] = useState(false);
  const { selectedTheme, changeBackgroundPic } = useTheme();
  const styles = getStyles(selectedTheme);

  const [selected, setSelected] = useState();
  const handleLogout = async () => {
    await logout();
    router.replace("login");
  };

  //  const selectImage = async () => {
  //     try {
  //       const result = await ImagePicker.launchImageLibraryAsync({
  //         mediaTypes: ["images"],
  //         allowsEditing: true,
  //         quality: 1,
  //       });
  //       const selectedImage = result.assets[0];
  //       setProfileUrl(selectedImage.uri);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  const selectImage = async () => {
    try {
      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorMessage) {
        console.log("ImagePicker Error: ", response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0].uri;
        console.log("ImagePicker Selected: ", selectedImage);
        await changeBackgroundPic(selectedImage);
        showToast("Background Picture Changed");
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      showToast("Failed to change background picture");
    }
  };

  return (
    <ScrollView style={styles.upContainer}>
      <StatusBar style={`${selectedTheme.Statusbar.style}`} animated={true} />
      {/* back icon */}
      {/* <TouchableOpacity
        // style={styles.backButton}
        onPress={() => router.navigate("..")}
      >
        <MaterialIcons name="arrow-back" size={25} color={styles.IconColor} />
      </TouchableOpacity> */}
      {/* User Profile Info */}
      <View style={styles.upProfileContainer}>
        {imageFailed || profileUrl == "" ? (
          <Image
            style={styles.upAvatar}
            source={require("../../../myAssets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp")}
            transition={500}
          />
        ) : (
          <Image
            style={styles.upAvatar}
            source={{ uri: profileUrl }}
            transition={500}
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
          onPress={() => router.navigate("/editProfile")}
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
      </View>
    </ScrollView>
  );
};

export default UserProfileContent;
