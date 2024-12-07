import { memo, React, useState } from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { MaterialIcons } from "@expo/vector-icons";
import getStyles from "./Component_Styles";

const TopHeaderBar = memo(({ title, backButtonShown, theme }) => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);
  const styles = getStyles(theme);

  const handleLogout = () => {
    logout();
    navigation.replace("Login");
  };
  // Fetch user profile picture when component mounts

  return (
    <View style={styles.hhHeaderContainer}>
      {/* Back Button */}
      {backButtonShown && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
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

      {/* User Profile Picture */}
      <View>
        <Menu>
          <MenuTrigger>
            {user?.profileUrl == "" ||
            user?.profileUrl == null ||
            imageFailed ? (
              <Image
                source={require("../../myAssets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp")}
                style={{ width: 45, height: 45, borderRadius: 30 }}
                transition={500}
              />
            ) : (
              <Image
                source={{ uri: user?.profileUrl }}
                style={{ width: 45, height: 45, borderRadius: 30 }}
                transition={500}
                onError={() => setImageFailed(true)}
              />
            )}
          </MenuTrigger>
          <MenuOptions
            style={styles.hhContainer}
            customStyles={{
              optionsContainer: {
                elevation: 5,
                borderRadius: 10,
                borderCurve: "circular",
                marginTop: 40,
                marginLeft: -30,
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
                navigation.navigate("UserProfile");
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
      </View>
    </View>
  );
});

export default TopHeaderBar;
