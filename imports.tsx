// Utility functions
export {
  getCurrentTime,
  getRoomId,
  formatTimeWithoutSeconds,
  formatTime,
} from "./Functions/Commons";
export { fetchCachedMessages, cacheMessages } from "./Functions/CacheMessages";
export { default as createRoomIfItDoesNotExist } from "./Functions/CreateRoomIfItDoesNotExist";

// Firebase
export { db, usersRef, storage } from "./env/firebaseConfig";

// Contexts
export { useAuth } from "./context/AuthContext";
export { useTheme } from "./context/ThemeContext";
export { AuthContextProvider } from "./context/AuthContext";
export { ThemeContextProvider } from "./context/ThemeContext";

// Themes
export { default as darkTheme } from "./Themes/DarkMode";
export { default as lightBlueTheme } from "./Themes/SkyLander";
export { default as greenTheme } from "./Themes/Greenday";
export { default as purpleTheme } from "./Themes/Purple";

// Services
export { default as ExpoPushNotifications } from "./services/ExpoPushNotifications";

// Styles
export { default as getStyles } from "./styles/sreen_Styles";

// Assets
import Send from "./myAssets/Lottie_Files/send.json";
import OnlineChat from "./myAssets/Lottie_Files/Online Chat.json";
import SignUp from "./myAssets/Lottie_Files/Sign Up.json";
import EmptyChatRoom from "./myAssets/Lottie_Files/Animation - 1730912642416.json";
export { Send, OnlineChat, SignUp, EmptyChatRoom };
