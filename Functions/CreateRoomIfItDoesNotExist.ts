import { db } from "../env/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getCurrentTime } from "./Commons";
import { UserData } from "@/context/AuthContext";

const createRoomIfItDoesNotExist = async (
  roomId: string,
  user: UserData | null,
  userId: string | string[]
) => {
  const roomRef = doc(db, "rooms", roomId);

  // Check if the room already exists
  const roomSnapshot = await getDoc(roomRef);

  if (!roomSnapshot.exists()) {
    // Room does not exist, create it with default values
    await setDoc(
      roomRef,
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
  } else {
    // console.log("Room already exists");
  }
};

export default createRoomIfItDoesNotExist;
