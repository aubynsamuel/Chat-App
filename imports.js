// Utility functions
export { getCurrentTime, getRoomId, formatTimeWithoutSeconds } from "./Functions/Commons";
export { fetchCachedMessages, cacheMessages } from "./Functions/CacheMessages";
export { default as createRoomIfItDoesNotExist } from "./Functions/CreateRoomIfItDoesNotExist";

// Firebase
export { db, usersRef, storage } from "./env/firebaseConfig";

// Contexts
export { useAuth } from "./context/AuthContext";
export { useTheme } from "./context/ThemeContext";
export { AuthContextProvider } from "./context/AuthContext";
export { ThemeContextProvider } from "./context/ThemeContext";

// Components
export { default as ChatRoomBackground } from "./components/ChatRoomBackground";
export { default as HeaderBarChatScreen } from "./components/HeaderBar_ChatScreen";
export { default as HeaderBarHomeScreen } from "./components/HeaderBar_HomeScreen";
export { default as EmptyChatRoomList } from "./components/EmptyChatRoomList";
export { default as ChatList } from "./components/ChatList";

// Services
export { sendNotification, schedulePushNotification } from "./services/ExpoPushNotifications";
export { default as ExpoPushNotifications } from "./services/ExpoPushNotifications";

// Styles
export { default as getStyles } from "./styles/sreen_Styles";

// Assets
import Send from "./myAssets/Lottie_Files/send.json";
import OnlineChat from "./myAssets/Lottie_Files/Online Chat.json";
import SignUp from "./myAssets/Lottie_Files/Sign Up.json";
import EmptyChatRoom from "./myAssets/Lottie_Files/Animation - 1730912642416.json";
export { Send, OnlineChat, SignUp, EmptyChatRoom };

// Images
// import DefaultAvatar from "./myAssets/Images/default-profile-picture-avatar-photo-600nw-1681253560.webp";
// import DefaultChatBackground from "./myAssets/Images/default-chat-background.webp";
