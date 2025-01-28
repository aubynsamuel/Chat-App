import firestore from "@react-native-firebase/firestore";
import { getCurrentTime } from "./Commons";
import { UserData } from "../context/AuthContext";

const createRoomIfItDoesNotExist = async (
  roomId: string,
  user: UserData | null,
  userId: string | string[]
) => {
  try {
    const roomRef = firestore().collection("rooms").doc(roomId);
    const roomSnapshot = await roomRef.get();

    // Check if the room already exists
    if (!roomSnapshot.exists) {
      // Room does not exist, create it with default values
      await roomRef.set(
        {
          roomId,
          participants: [user?.userId, userId],
          createdAt: getCurrentTime(),
          lastMessage: "",
          lastMessageTimestamp: getCurrentTime(),
          lastMessageSenderId: "",
        },
        { merge: true }
      );
      console.log("Room has been created");
    } else {
      console.log("Room already exists");
    }
  } catch (error) {
    console.log("Error creating room", error);
  }
};

export default createRoomIfItDoesNotExist;
