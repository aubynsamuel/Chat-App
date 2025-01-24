import { messageData } from "./ExpoPushNotifications";

const API_URL = "https://chat-server-xet3.onrender.com/api";

async function sendNotification(
  recipientsToken: string,
  title: string, //senders name
  body: string,
  roomId: string,
  recipientsUserId: string,
  sendersUserId: string,
  profileUrl: string
) {
  const message = {
    to: recipientsToken,
    title,
    body: body.length < 100 ? body : body.substring(0, 100) + "...",
    data: {
      recipientsUserId: recipientsUserId,
      sendersUserId: sendersUserId,
      roomId: roomId,
      profileUrl: profileUrl,
    } as messageData,
    sound: "default",
    priority: "high",
    channelId: "fcm_fallback_notification_channel",
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    return await response.json();
  } catch (error) {
    console.error("Failed to send notification:", error);
    return null;
  }
}

const sendReply = async (
  sendersUserId: string,
  recipientsUserId: string,
  roomId: string,
  replyText: string
) => {
  try {
    const response = await fetch(`${API_URL}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sendersUserId,
        recipientsUserId,
        roomId,
        replyText,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    console.error("Error sending reply:", error);
    throw error;
  }
};

const markAsRead = async (sendersUserId: string, roomId: string) => {
  try {
    const response = await fetch(`${API_URL}/markAsRead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sendersUserId,
        roomId,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    console.error("Error marking as read:", error);
    throw error;
  }
};

export { markAsRead, sendReply, sendNotification };
