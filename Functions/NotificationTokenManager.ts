import AsyncStorage from "@react-native-async-storage/async-storage";
import { deviceToken } from "../services/RegisterForPushNotifications";
import firestore from "@react-native-firebase/firestore";

const expoPushTokenRegex = /^ExponentPushToken\[[a-zA-Z0-9-_]+\]$/;

const NotificationTokenManager = {
  async initializeAndUpdateToken(userId: string) {
    try {
      const newToken = deviceToken;

      if (!expoPushTokenRegex.test(newToken)) {
        console.warn("Invalid Expo push token format:", newToken);
        return;
      }

      const cachedToken = await AsyncStorage.getItem("deviceToken");

      if (cachedToken === newToken) {
        console.log("Token has not changed, no updates needed.");
        return;
      }

      await this.updateUserToken(userId, newToken);
    } catch (error) {
      console.error("Failed to initialize or update FCM token:", error);
    }
  },

  async updateUserToken(userId: string, token: string) {
    if (!userId || !token) {
      return;
    }
    try {
      if (!expoPushTokenRegex.test(token)) {
        console.warn("Invalid Expo push token format:", token);
        return;
      }

      const userDocRef = firestore().collection("users").doc(userId);

      // Update only the deviceToken field
      await userDocRef.update({
        deviceToken: token,
      });

      await AsyncStorage.setItem("deviceToken", token);
      console.log("Expo Push token updated and cached successfully.");
    } catch (error) {
      console.error("Error updating user token:", error);
    }
  },

  async getStoredToken() {
    try {
      const token = await AsyncStorage.getItem("deviceToken");
      return token || null;
    } catch (error) {
      console.error("Error retrieving token from AsyncStorage:", error);
      return null;
    }
  },
};

export default NotificationTokenManager;
