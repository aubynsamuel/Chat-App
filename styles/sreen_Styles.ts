import { Theme } from "../context/ThemeContext";
import { StyleSheet } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import darkTheme from "../Themes/DarkMode";

const getStyles = (theme: Theme) => {
  return StyleSheet.create({
    // Chat Room styles
    crContainer: {
      flex: 1,
    },
    crMessages: {
      marginTop: 55,
      flex: 1,
    },
    crScrollToEndButton: {
      transform: [{ rotate: "90deg" }],
    },
    editContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 5,
      paddingLeft: 5,
      borderTopColor: theme.border,
      width: "100%",
      borderRadius: 10,
    },
    editInput: {
      flex: 1,
      height: 40,
      paddingHorizontal: 10,
      color: theme === darkTheme ? "black" : theme.text.primary,
    },
    editButton: {
      backgroundColor: theme.surface,
      borderRadius: 40,
      paddingHorizontal: 15,
      marginHorizontal: 2,
      paddingVertical: 4,
    },
    editButtonText: {
      color: theme.primary,
      fontWeight: "bold",
      width: 18,
      textAlign: "center",
    },

    // Edit Profile Screen
    epContainer: {
      flex: 1,
      padding: 15,
      paddingTop: 40,
      backgroundColor: theme.background,
    },
    epProfileImage: {
      width: 300,
      height: 300,
      borderRadius: 150,
      marginBottom: 20,
      alignSelf: "center",
    },
    epChangePicText: {
      color: theme.text.primary,
      fontWeight: "bold",
      marginBottom: 20,
      alignSelf: "center",
      fontSize: 16,
    },
    epInputField: {
      marginBottom: 20,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: theme.input.border,
      borderRadius: 8,
      height: hp("6%"),
      width: wp("80%"),
      flexDirection: "row",
      alignItems: "center",
    },
    epInputText: {
      marginLeft: 10,
      fontSize: 16,
      flex: 1,
      color: theme.text.primary,
    },
    epSaveButton: {
      backgroundColor: theme.primary,
      padding: 10,
      borderRadius: 8,
      width: wp("80%"),
      alignSelf: "center",
      elevation: 3,
    },
    epSaveButtonText: {
      color: theme.text.primary,
      fontSize: 20,
      fontWeight: "500",
      textAlign: "center",
    },

    // Home Screen
    hsContainer: {
      paddingHorizontal: 10,
      // paddingBottom: 10,
      flex: 1,
    },
    floatingButton: {
      position: "absolute",
      bottom: 50,
      right: 20,
      backgroundColor: theme === darkTheme ? "white" : theme.surface,
      borderRadius: 50,
      width: 50,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      elevation: 4,
    },

    // Login Screen
    lsLoginHeaderText: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 15,
      alignSelf: "center",
      color: theme.text.primary,
    },
    lsForm: {
      width: wp("80%"),
      alignSelf: "center",
    },
    lsInputField: {
      marginBottom: 10,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: theme.input.border,
      borderRadius: 8,
      height: hp("6%"),
      width: wp("80%"),
      flexDirection: "row",
      alignItems: "center",
    },
    lsInputText: {
      marginLeft: 10,
      fontSize: 16,
      flex: 1,
      color: theme.text.primary,
    },
    lsLoginButton: {
      backgroundColor: theme.primary,
      padding: 10,
      borderRadius: 8,
      marginTop: 15,
      width: wp("80%"),
      alignSelf: "center",
      elevation: 1,
    },
    lsLoginButtonText: {
      color: theme.text.primary,
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
    },
    lsForgotPasswordText: {
      fontSize: 15,
      fontWeight: "bold",
      alignSelf: "flex-end",
      color: theme.secondary,
    },
    lsDontHaveAnAccount: {
      marginTop: 5,
      fontSize: 15,
      fontWeight: "bold",
      color: theme.text.primary,
    },
    lsSignUp: {
      marginTop: 5,
      color: theme.secondary,
      fontSize: 15,
      fontWeight: "bold",
    },

    // Search User Screen
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      backgroundColor: theme.primary,
    },
    searchInput: {
      marginLeft: 10,
      padding: 8,
      flex: 1,
      backgroundColor: theme.input.background,
      borderRadius: 8,
      fontSize: 16,
      color: theme === darkTheme ? "black" : theme.text.primary,
    },
    userItem: {
      padding: 5,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      marginLeft: 10,
      marginRight: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    username: {
      fontSize: 18,
      color: theme.text.primary,
      marginLeft: 10,
    },
    noResults: {
      padding: 20,
      marginTop: "10%",
      textAlign: "center",
      color: theme.text.secondary,
      fontSize: 16,
    },

    // Sign up screen
    suSignUpFormHeader: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 15,
      alignSelf: "center",
      color: theme.text.primary,
    },
    suForm: {
      width: wp("80%"),
      alignSelf: "center",
    },
    suInputField: {
      marginBottom: 10,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: theme.input.border,
      borderRadius: 8,
      height: hp("6%"),
      width: wp("80%"),
      flexDirection: "row",
      alignItems: "center",
    },
    suInputText: {
      marginLeft: 10,
      fontSize: 16,
      flex: 1,
      color: theme.text.primary,
    },
    suSignUpButton: {
      backgroundColor: theme.primary,
      padding: 10,
      borderRadius: 8,
      marginTop: 5,
      width: wp("80%"),
      alignSelf: "center",
      elevation: 1,
    },
    suSignUpText: {
      color: theme.text.primary,
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
    },
    suHaveAnAccount: {
      marginTop: 5,
      fontSize: 15,
      fontWeight: "bold",
      color: theme.text.primary,
    },
    suLoginText: {
      marginTop: 5,
      color: theme.secondary,
      fontSize: 15,
      fontWeight: "bold",
    },

    // User profile screen
    upContainer: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 15,
      paddingTop: 40,
    },
    upProfileContainer: {
      alignItems: "center",
      marginVertical: 20,
    },
    upAvatar: {
      height: 200,
      width: 200,
      borderRadius: 200,
      marginBottom: 15,
    },
    upUsername: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text.primary,
    },
    upOptionsContainer: {
      marginVertical: 15,
    },
    upOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      backgroundColor: theme.primary,
      borderRadius: 20,
      marginBottom: 10,
      elevation: 3,
    },
    upOptionText: {
      marginLeft: 10,
      fontSize: 16,
      color: theme.text.primary,
    },
  });
};

export default getStyles;
