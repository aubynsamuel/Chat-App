import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import React from "react";
import registerForPushNotificationsAsync from "./RegisterForPushNotifications";
import { userDetails as user } from "../context/AuthContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function ExpoPushNotifications({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    Notifications.dismissAllNotificationsAsync();
    async function setupNotifications() {
      try {
        await registerForPushNotificationsAsync();
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    }

    setupNotifications();
  }, [user]);

  return <>{children}</>;
}
