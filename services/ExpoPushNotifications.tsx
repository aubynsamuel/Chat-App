import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import React from "react";
import registerForPushNotificationsAsync from "./RegisterForPushNotifications";
// import {
//   handleMarkAsReadAction,
//   handleReplyAction,
// } from "./NotificationActions";
import { userDetails as user } from "../context/AuthContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export default function ExpoPushNotifications({
  children,
}: {
  children: React.ReactNode;
}) {
  // const responseListener = useRef(null);

  useEffect(() => {
    // let notificationListener;
    Notifications.dismissAllNotificationsAsync();
    async function setupNotifications() {
      try {
        // Register for push notifications
        await registerForPushNotificationsAsync();

        // Set up notification categories
        // await notificationCategories();

        // Listen for incoming notifications
        // notificationListener = Notifications.addNotificationReceivedListener(
        //   async (notification) => {
        //     const content = notification.request.content;
        //     console.log("Remote Notification Received:", notification);

        //     const { tokenToReplyTo, replyToRoomId } = content.data || {};
        //     const { title, body } = content || {};

        //     console.log(`Title: ${title}`);
        //     console.log(`Body: ${body}`);
        //     console.log(`Reply To Token: ${tokenToReplyTo}`);
        //     console.log(`RoomId: ${replyToRoomId}`);
        //   }
        // );

        // Listen for notification responses
        // responseListener.current =
        //   Notifications.addNotificationResponseReceivedListener(
        //     async (response) => {
        //       const { actionIdentifier, userText } = response;
        //       const content = response.notification.request.content;
        //       const { tokenToReplyTo, replyToRoomId } = content.data || {};

        //       if (actionIdentifier === "REPLY_ACTION" && userText) {
        //         console.log("Reply Action:", userText);
        //         await handleReplyAction(userText, user, replyToRoomId, tokenToReplyTo);
        //       } else if (actionIdentifier === "MARK_AS_READ") {
        //         console.log("Mark as Read Action");
        //         await handleMarkAsReadAction(user, replyToRoomId);
        //       }

        //       // Dismiss the notification
        //       if (response.notification) {
        //         await Notifications.dismissNotificationAsync(
        //           response.notification.request.identifier
        //         );
        //       }
        //     }
        //   );
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    }

    setupNotifications();

    // Cleanup
    // return () => {
    //   if (responseListener.current) {
    //     Notifications.removeNotificationSubscription(responseListener.current);
    //   }
    // if (notificationListener) {
    //   Notifications.removeNotificationSubscription(notificationListener);
    // }
    // };
  }, [user]);

  // const notificationCategories = async () => {
  //   try {
  //     await Notifications.setNotificationCategoryAsync("MESSAGE_CATEGORY", [
  //       {
  //         identifier: "REPLY_ACTION",
  //         buttonTitle: "Reply",
  //         options: {
  //           opensAppToForeground: true,
  //           isDestructive: false,
  //           isAuthenticationRequired: false,
  //         },
  //         textInput: {
  //           submitButtonTitle: "Send",
  //           placeholder: "Type your reply...",
  //         },
  //       },
  //       {
  //         identifier: "MARK_AS_READ",
  //         buttonTitle: "Mark as Read",
  //         options: {
  //           opensAppToForeground: false,
  //           isDestructive: false,
  //           isAuthenticationRequired: false,
  //         },
  //       },
  //     ]);
  //     console.log("Notification category set successfully!");
  //   } catch (error) {
  //     console.error("Failed to set notification category:", error);
  //   }
  // };

  return <>{children}</>;
}

// export async function schedulePushNotification(title, body, roomId) {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: title,
//       body: body,
//       data: { replyToRoomId: roomId || null },
//       categoryIdentifier: "MESSAGE_CATEGORY",
//     },
//     trigger: null,
//   });
// }
