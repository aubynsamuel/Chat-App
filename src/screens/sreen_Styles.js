import { StyleSheet } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

export default getStyles = (theme) => {
  return StyleSheet.create({
    // Chat Room styles
    crContainer: {
      flex: 1,
    },
    crMessages: {
      marginTop: 65,
      flex: 1,
    },
    crInputContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
      margin: 10,
      borderRadius: 10,
      // zIndex: 2,
      backgroundColor: theme.input.background,
    },
    crTextInputField: {
      width: "90%",
      color: theme === purpleTheme ? theme.text.inverse : theme.text.primary,
      paddingHorizontal: 10,
      fontSize: 16,
      flex: 1,
    },
    crSendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
    },
    crReplyPreview: {
      flexDirection: "row",
      alignSelf: "center",
      justifyContent: "center",
      backgroundColor: theme.surface,
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      top: 16,
      width: "90%",
    },
    crReplyPreviewContent: {
      flex: 1,
      marginRight: 8,
    },
    crReplyPreviewName: {
      fontSize: 12,
      fontWeight: "bold",
      color: theme.primary,
    },
    cdReplyPreviewText: {
      fontSize: 12,
      color: theme.primary,
    },
    crAccessoryContainer: {
      height: 44,
      width: "100%",
      backgroundColor: "white",
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "rgba(0,0,0,0.3)",
    },
    crScrollToEndButton: {
      transform: [{ rotate: "90deg" }],
    },
    crEditingPreview: {
      flexDirection: "row",
      alignSelf: "center",
      justifyContent: "space-between",
      backgroundColor: theme.surface,
      padding: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      top: 16,
      width: "90%",
    },
    crEditingPreviewText: {
      fontSize: 12,
      color: theme.primary,
    },
    crEditingPreviewName: {
      fontSize: 12,
      fontWeight: "bold",
      color: theme.primary,
    },

    sectionHeader: {
      backgroundColor: theme.background,
      opacity: 0.8,
      borderRadius: 8,
      alignSelf: "center",
      marginVertical: 5,
    },
    sectionHeaderText: {
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
      marginHorizontal: 5,
      marginVertical: 1,
      color: theme.text.primary,
    },


    // news styles for editing 
    editContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      backgroundColor: theme.background, // Match the background color of the chat
      // borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,       // Add a subtle border (optional)
    },
    editInput: {
      flex: 1,                                  // Take up remaining space
      height: 40,                                // Set a fixed height or adjust as needed
      borderColor: theme.border,        // Match the border color
      // borderWidth: StyleSheet.hairlineWidth,
      // borderRadius: 20,                           // Rounded corners
      paddingHorizontal: 10,
      marginRight: 10,
      color: theme.text.primary, // Set text color based on the theme
    },
    editButton: {
      backgroundColor: theme.surface, // Use your secondary color or choose a suitable one
      borderRadius: 10,
      paddingHorizontal: 15,
      marginHorizontal:2,
      paddingVertical: 4,
    
    },
    editButtonText: {
      color: theme.primary, // Text color that contrasts with the button background
      fontWeight: 'bold',
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
      color: theme === purpleTheme ? theme.text.inverse : theme.text.primary,
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
      color: theme === purpleTheme ? theme.text.inverse : theme.text.primary,
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
      fontWeight: "450",
      textAlign: "center",
    },

    // Home Screen
    hsContainer: {
      padding: 10,
      paddingBottom: 10,
      backgroundColor: theme === darkTheme ? theme.background : null,
      flex: 1,
    },
    floatingButton: {
      position: "absolute",
      bottom: 50,
      right: 20,
      backgroundColor: theme.primary,
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
      color: theme == purpleTheme ? theme.text.inverse : theme.text.primary,
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
      color: theme === purpleTheme ? theme.text.inverse : theme.text.primary,
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
      color: theme == purpleTheme ? theme.text.inverse : theme.text.primary,
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
      color: theme === purpleTheme ? theme.inverse : theme.text.primary,
    },
    userItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      marginLeft: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    username: {
      fontSize: 18,
      color: theme === purpleTheme ? theme.text.inverse : theme.text.primary,
      marginLeft: 10,
    },
    noResults: {
      padding: 20,
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
      color: theme == purpleTheme ? theme.text.inverse : theme.text.primary,
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
      color: theme == purpleTheme ? theme.text.inverse : theme.text.primary,
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
      color: theme == purpleTheme ? theme.text.inverse : theme.text.primary,
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
      color: theme === purpleTheme ? theme.text.inverse : theme.text.primary,
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
    IconColor: theme == purpleTheme ? theme.text.inverse : theme.text.primary,
  });
};
