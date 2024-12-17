import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useTheme, getStyles, useAuth } from "../../imports";

const EditProfileScreen = () => {
  const { user, updateProfile, showToast } = useAuth();
  const [username, setUsername] = useState(user.username || "");
  const [profileUrl, setProfileUrl] = useState(user.profileUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedTheme } = useTheme();
  const styles = getStyles(selectedTheme);

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });
      const selectedImage = result.assets[0];
      setProfileUrl(selectedImage.uri);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);

    if (!username) {
      showToast("Username cannot be empty");
      setIsLoading(false);
      return;
    }

    try {
      let downloadURL = profileUrl;

      // If profileUrl is a local URI (starts with file://), upload it to Firebase Storage
      if (profileUrl && profileUrl.startsWith("file://")) {
        const storage = getStorage();
        const storageRef = ref(storage, `profilePictures/${user.uid}`);

        const response = await fetch(profileUrl);
        const blob = await response.blob();

        const uploadTask = uploadBytesResumable(storageRef, blob, {
          contentType: "image/jpeg",
        });

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
          },
          (error) => {
            console.error("Upload failed:", error.message);
            showToast("Picture Could Not Be Uploaded");
            setIsLoading(false);
          },
          async () => {
            downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("File available at", downloadURL);

            const response = await updateProfile({
              username,
              profileUrl: downloadURL, // Use Firebase Storage URL
            });

            if (response.success) {
              showToast("Profile updated successfully!");
              router.replace("/home");
            } else {
              showToast(response.msg);
            }
            setIsLoading(false);
          }
        );
      } else {
        const response = await updateProfile({ username, profileUrl });
        if (response.success) {
          showToast("Profile updated successfully!");
          router.replace("/home");
        } else {
          showToast(response.msg);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Failed to update profile");
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.epContainer}>
      <StatusBar style={`${selectedTheme.Statusbar.style}`} animated={true} />
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: selectedTheme.secondary,
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        Let Others Recognize You Easily
      </Text>
      <Text
        style={{
          fontSize: 13.5,
          textAlign: "center",
          marginBottom: 40,
          fontWeight: "bold",
          color: selectedTheme.text.primary,
          textTransform: "uppercase",
        }}
      >
        Set Your Username and Profile Picture
      </Text>
      <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
        {/* Profile Picture */}
        {profileUrl ? (
          <Image source={{ uri: profileUrl }} style={styles.epProfileImage} />
        ) : (
          <Image
            source={require("../../myAssets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp")}
            style={styles.epProfileImage}
          />
        )}
        <TouchableOpacity onPress={selectImage}>
          <Text style={styles.epChangePicText}>Change Profile Picture</Text>
        </TouchableOpacity>

        {/* Username */}
        <View style={styles.epInputField}>
          <MaterialIcons name="person" color={styles.IconColor} size={25} />
          <TextInput
            placeholder="Username*"
            style={styles.epInputText}
            placeholderTextColor={"grey"}
            value={username}
            onChangeText={setUsername}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.epSaveButton}
          onPress={handleUpdateProfile}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Text style={styles.epSaveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditProfileScreen;
