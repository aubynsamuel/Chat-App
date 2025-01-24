import React, { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { MaterialIcons } from "@expo/vector-icons";
import getStyles from "../styles/Component_Styles";
import { useAuth } from "../imports";
import { Theme } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";

interface HeaderBarProp {
  title: string;
  theme: Theme;
  menuButtonShown?: boolean;
  searchButtonShown?: boolean;
}
const TopHeaderBar = memo(
  ({
    title,
    theme,
    menuButtonShown = true,
    searchButtonShown,
  }: HeaderBarProp) => {
    const navigation = useNavigation();
    const { logout } = useAuth();
    const styles = getStyles(theme);

    const handleLogout = () => {
      logout();
      navigation.reset({ index: 0, routes: [{ name: "(auth)" }] } as any);
    };

    return (
      <View style={styles.hhHeaderContainer}>
        {/* HeaderTitle */}
        <Text style={styles.hhHeaderTitle}>{title}</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
          {/* Search button */}
          {searchButtonShown && (
            <TouchableOpacity
              onPress={() => navigation.navigate("searchUsers" as never)}
            >
              <MaterialIcons
                name="search"
                size={22}
                color={theme.text.primary}
              />
            </TouchableOpacity>
          )}

          {/*Context Menu Button */}
          {menuButtonShown && (
            <Menu>
              <MenuTrigger>
                <MaterialIcons
                  name="more-vert"
                  size={24}
                  color={theme.text.primary}
                />
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    elevation: 5,
                    borderRadius: 10,
                    borderCurve: "circular",
                    marginTop: 30,
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
                    navigation.navigate("(profileStack)" as never);
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
