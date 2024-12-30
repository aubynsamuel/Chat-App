import React, { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { MaterialIcons } from "@expo/vector-icons";
import { ExternalPathString, router } from "expo-router";
import getStyles from "../styles/Component_Styles";
import { useAuth } from "../imports";
import { Theme } from "../context/ThemeContext";

interface HeaderBarProp {
  title: string;
  theme: Theme;
  backButtonShown: boolean;
  profilePicShown?: boolean;
  searchButtonShown?: boolean;
}
const TopHeaderBar = memo(
  ({
    title,
    theme,
    backButtonShown,
    profilePicShown = true,
    searchButtonShown,
  }: HeaderBarProp) => {
    const { logout } = useAuth();
    // const [imageFailed, setImageFailed] = useState(false);
    const styles = getStyles(theme);

    const handleLogout = () => {
      logout();
      router.replace("/login" as ExternalPathString);
    };

    return (
      <View style={styles.hhHeaderContainer}>
        {/* Back Button */}
        {backButtonShown && (
          <TouchableOpacity onPress={() => router.navigate("..")}>
            <MaterialIcons
              name="arrow-back"
              style={styles.hhHeaderBarIcon}
              color={"black"}
              size={25}
            />
          </TouchableOpacity>
        )}

        {/* HeaderTitle */}
        <Text style={styles.hhHeaderTitle}>{title}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
          {/* Search button */}
          {searchButtonShown && (
            <TouchableOpacity onPress={() => router.navigate("/searchUsers")}>
              <MaterialIcons name="search" size={22} />
            </TouchableOpacity>
          )}

          {/* User Profile Picture */}
          {profilePicShown && (
            <Menu>
              <MenuTrigger>
                {/* {user?.profileUrl == "" ||
                user?.profileUrl == null ||
                imageFailed ? (
                  <Image
                    source={require("../myAssets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp")}
                    style={{ width: 45, height: 45, borderRadius: 30 }}
                  />
                ) : (
                  <Image
                    source={{ uri: user?.profileUrl }}
                    style={{ width: 45, height: 45, borderRadius: 30 }}
                    onError={() => setImageFailed(true)}
                  />
                )} */}
                <MaterialIcons name="more-vert" size={24} color={"black"} />
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    elevation: 5,
                    borderRadius: 10,
                    borderCurve: "circular",
                    marginTop: 40,
                    marginLeft: -30,
                  },
                  optionsWrapper: {
                    backgroundColor: theme.primary,
                    elevation: 10,
                  },
                }}
              >
                {/* Profile */}
                <MenuOption
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onSelect={() => {
                    router.navigate("/profile" as ExternalPathString);
                  }}
                >
                  <Text style={styles.hhMenuText}>Profile</Text>
                  <MaterialIcons
                    name="person"
                    color={theme.text.primary}
                    size={25}
                  />
                </MenuOption>

                {/* Logout */}
                <MenuOption
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onSelect={() => {
                    handleLogout();
                  }}
                >
                  <Text style={styles.hhMenuText}>Sign Out</Text>
                  <MaterialIcons
                    name="logout"
                    color={theme.text.primary}
                    size={25}
                  />
                </MenuOption>
              </MenuOptions>
            </Menu>
          )}
        </View>
      </View>
    );
  }
);

export default TopHeaderBar;
