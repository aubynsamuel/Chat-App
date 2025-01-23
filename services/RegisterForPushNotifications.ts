import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export let deviceToken: string;

async function registerForPushNotificationsAsync() {
  let token;

  // if (Platform.OS === "android") {
  //   await Notifications.setNotificationChannelAsync("default", {
  //     name: "default",
  //     importance: Notifications.AndroidImportance.MAX,
  //     vibrationPattern: [0, 250, 250, 250],
  //     lightColor: "#FF231F7C",
  //   });
  // }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.error("Failed to get push token for push notification!");
      return;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      deviceToken = token;
      console.log("Expo Push Token: " + deviceToken);
    } catch (e) {
      token = `${e}`;
      deviceToken = token;
      console.log("Expo Push Token: " + deviceToken);
    }
  } else {
    console.error("Must use physical device for Push Notifications");
  }
  return token;
}

export default registerForPushNotificationsAsync;
