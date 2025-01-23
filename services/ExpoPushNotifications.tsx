import React, { useEffect } from "react";
import notifee, {
  AndroidColor,
  AndroidImportance,
  EventDetail,
  EventType,
} from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import backgroundListener, { backgroundListenerFireBase } from "../background";
import registerForPushNotificationsAsync from "./RegisterForPushNotifications";
import { markAsRead, sendReply } from "./NotificationActions";

interface handleForegroundEvent {
  type: EventType;
  detail: EventDetail;
}

export interface messageData {
  recipientsUserId: string;
  sendersUserId: string;
  roomId: string;
}

let notificationBody: messageData;

const ExpoPushNotifications = ({ children }: { children: React.ReactNode }) => {
  // const renderRef = useRef(0);
  // console.log("Rendered", renderRef.current++);

  useEffect(() => {
    console.log("setting up Up Notification set up");
    setupNotifications();
    createLowImportanceChannel();
    createHighImportanceChannel();

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      displayNotification(
        remoteMessage.notification?.title as string,
        remoteMessage.notification?.body as string
      );
      const parsedData: messageData = JSON.parse(
        remoteMessage.data?.body as any
      );
      console.log("Message handled in the background!", parsedData);
      notificationBody = parsedData;
    });

    const unsubscribeForegroundListener = messaging().onMessage(
      async (remoteMessage) => {
        displayNotification(
          remoteMessage.notification?.title as string,
          remoteMessage.notification?.body as string
        );
        const parsedData: messageData = JSON.parse(
          remoteMessage.data?.body as any
        );
        console.log("Message handled in the foreground ", parsedData);
        notificationBody = parsedData;
      }
    );

    notifee.onBackgroundEvent(async ({ type, detail }) => {
      const {
        recipientsUserId: sendersUserId,
        roomId,
        sendersUserId: recipientsUserId,
      } = notificationBody;
      if (detail.pressAction?.id === "reply") {
        sendReply(
          sendersUserId,
          recipientsUserId,
          roomId,
          detail.input as string
        );
        console.log(`Reply button pressed in background ${detail.input}.`);
      } else if (detail.pressAction?.id === "mark-as-read") {
        markAsRead(sendersUserId, roomId);
        console.log("Marked as read in the background.");
      } else {
        console.log("Notification pressed");
      }
    });

    const unsubscribeForegroundEvent = notifee.onForegroundEvent(
      handleForegroundEvent
    );

    return () => {
      console.log("Cleaning Up Notification set up");
      try {
        unsubscribeForegroundEvent();
        unsubscribeForegroundListener();
      } catch (error) {
        console.warn("Error cleaning up component ", error);
      }
    };
  }, []);

  //* ----------------------END OF USEEFFECT--------------------------------------------

  const handleForegroundEvent = async ({
    type,
    detail,
  }: handleForegroundEvent) => {
    const {
      recipientsUserId: sendersUserId,
      roomId,
      sendersUserId: recipientsUserId,
    } = notificationBody;
    if (detail.pressAction?.id === "reply") {
      sendReply(
        sendersUserId,
        recipientsUserId,
        roomId,
        detail.input as string
      );
      console.log(`Reply button pressed in background ${detail.input}.`);
    } else if (detail.pressAction?.id === "mark-as-read") {
      markAsRead(sendersUserId, roomId);
      console.log("Mark as Read button pressed in foreground.");
    } else {
      console.log("Notification pressed");
    }
  };

  const createLowImportanceChannel = async () => {
    try {
      await notifee.createChannel({
        id: "fcm_fallback_notification_channel",
        name: "Low Importance Notifications",
        importance: AndroidImportance.LOW,
        vibration: false,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const createHighImportanceChannel = async () => {
    try {
      await notifee.createChannel({
        id: "high-importance-channel",
        name: "High Importance Notifications",
        importance: AndroidImportance.HIGH,
        vibration: true,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const setupNotifications = async () => {
    try {
      await registerForPushNotificationsAsync();
    } catch (error) {
      console.error("Error setting up notifications:", error);
    }
  };

  const displayNotification = async (title: string, body: string) => {
    try {
      await notifee.displayNotification({
        title: title,
        body: body,
        android: {
          channelId: "high-importance-channel",
          smallIcon: "ic_launcher",
          color: AndroidColor.GREEN,
          pressAction: { id: "default" },
          autoCancel: true,
          showTimestamp: true,
          onlyAlertOnce: true,
          // style: {
          //   type: AndroidStyle.MESSAGING,
          //   person: { name: title },
          //   messages: [{ text: body, timestamp: Date.now() }],
          //   group: false,
          // },
          actions: [
            {
              title: "Reply",
              pressAction: { id: "reply" },
              input: {
                placeholder: "Type you reply here",
              },
            },
            {
              title: "Mark as Read",
              pressAction: { id: "mark-as-read" },
            },
          ],
        },
      });
    } catch (error) {
      console.error("Notification Error:", error);
    }
  };

  return <>{children}</>;
};

export default ExpoPushNotifications;

backgroundListener;
backgroundListenerFireBase;
