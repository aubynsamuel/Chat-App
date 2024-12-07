import { StyleSheet } from "react-native";

export default getStyles = (theme) => {
  return StyleSheet.create({
    // Chat list component
    clEmptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 50,
    },
    clEmptyText: {
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: "center",
    },
    clCenterEmptySet: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    // Chat Object
    chatBox: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    name: {
      fontSize: 18,
      fontWeight: "600",
      color: theme == purpleTheme ? theme.text.inverse : theme.text.primary,
      marginVertical: 0,
    },
    lastMessage: {
      fontSize: 14,
      color: theme.text.secondary,
    },
    time: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 2,
      alignSelf: "flex-end",
    },
    unread: {
      color: theme.text.primary,
      borderRadius: 5,
      padding: 1,
      fontSize: 15,
      alignSelf: "flex-end",
      backgroundColor: theme.primary,
      width: "auto",
      paddingHorizontal: 5,
    },

    // HeaderBar Chat Screen
    hcHeaderContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      backgroundColor: theme.screenHeaderBarColor,
      elevation: 10,
      justifyContent: "space-between",
      overflow: "hidden",
    },
    hcHeaderTitle: {
      fontSize: 20,
      fontWeight: "500",
      marginHorizontal: 10,
      color: theme.text.primary,
      marginRight:53
    },
    hcHeaderBarIcon: {
      marginHorizontal: 10,
    },
    hcContainer: {
      backgroundColor: theme.primary,
      elevation: 10,
    },
    hcAvatar: {
      height: 45,
      width: 45,
      borderRadius: 30,
      position: 'absolute',
      right: 10,
      zIndex: 2,
    },
    hcProfileContainer: {
      alignItems: "flex-end",
      justifyContent: "center",
      zIndex: 1,
    },
    hcMenuOptionsContainer: {
      elevation: 5,
      borderRadius: 10,
      borderCurve: "circular",
      marginTop: 40,
      marginLeft: -30,
    },

    // HeaderBar Home Screen
    hhHeaderContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      backgroundColor: theme.screenHeaderBarColor,
      elevation: 10,
      height: 65,
      justifyContent: "space-between",
    },
    hhHeaderTitle: {
      fontSize: 25,
      fontWeight: "500",
      marginHorizontal: 10,
      color: theme.text.primary,
    },
    hhHeaderBarIcon: {
      marginHorizontal: 10,
    },
    hhContainer: {
      backgroundColor: theme.primary,
      elevation: 10,
    },
    hhMenuText: {
      fontSize: 15,
      margin: 8,
      color: theme.text.primary,
    },

    // Message Object
    userMessageContainer: {
      backgroundColor: theme.message.user.background,
      borderRadius: 7,
      marginVertical: 5,
      alignSelf: "flex-end",
      maxWidth: "70%",
      paddingHorizontal: 5,
      paddingVertical: 3,
      elevation: 2
    },
    otherMessageContainer: {
      backgroundColor: theme.message.other.background,
      borderRadius: 7,
      marginVertical: 5,
      alignSelf: "flex-start",
      maxWidth: "70%",
      paddingHorizontal: 5,
      paddingVertical: 3,
      elevation: 2
    },
    userMessage: {
      fontSize: 16,
      color: theme.message.user.text,
    },
    otherMessage: {
      fontSize: 16,
      color: theme.message.other.text,
    },
    userTime: {
      fontSize: 10,
      color: theme.message.user.time,
      alignSelf: "flex-start",
    },
    otherTime: {
      fontSize: 10,
      color: theme.message.other.time,
      alignSelf: "flex-end",
    },
    replyAction: {
      justifyContent: "center",
      alignItems: "center",
      width: 64,
      borderRadius: 7,
      marginVertical: 5,
    },
    replyRefMessageContainer: {
      borderRadius: 5,
      padding: 5,
      opacity: 0.8,
      marginBottom: 5,
    },
    replyToName: {
      fontSize: 12,
      fontWeight: "bold",
      color: theme.surface,
    },
    replyToContent: {
      fontSize: 12,
      color: theme.text.primary,
      opacity: 0.7,
    },
    referenceMessageContainer: {
      width: "100%",
      backgroundColor: theme.background,
      opacity: 0.9,
      borderRadius: 10,
    },
    menuContainer: {
      backgroundColor: theme.primary,
      elevation: 2,
    },
    moMenuText: {
      fontSize: 15,
      margin: 8,
      color: theme.text.primary,
    },
  });
};
