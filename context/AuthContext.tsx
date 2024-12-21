import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import storage from "../Functions/Storage";
import { showToast as showToastMessage } from "au-react-native-toast";
import { auth, db } from "../env/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export let userDetails: UserData | null;

// Define interfaces for type safety
export interface UserData {
  userId: string;
  username?: string;
  email: string;
  profileUrl?: string;
  deviceToken?: string;
  uid?: any;
}

export interface AuthContextType {
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; data?: User; msg?: string }>;
  logout: () => Promise<void>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; data?: User; msg?: string }>;
  user: UserData | null;
  isAuthenticated: boolean | undefined;
  isLoading: boolean;
  updateProfile: (
    userData: Partial<UserData>
  ) => Promise<{ success: boolean; msg?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; msg?: string }>;
  showToast: (message: string, containerStyles?: any, textStyles?: any) => void;
  addToUnread: (roomId: string) => void;
  removeFromUnread: (roomId: string) => void;
  unreadChats: string[];
  setDeviceToken: React.Dispatch<React.SetStateAction<string>>;
  setProfileUrlLink: React.Dispatch<React.SetStateAction<string>>;
  profileUrl: string;
  gettingLocationOverlay: boolean;
  setGettingLocationOverlay: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};

// Constants for storage keys
const STORAGE_KEYS = {
  USER: "user_data",
  AUTH_STATE: "auth_state",
};

interface AuthContextProviderProps {
  children: React.ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadChats, setUnreadChats] = useState<string[]>([]);
  const [deviceToken, setDeviceToken] = useState<string>("");
  const [profileUrl, setProfileUrlLink] = useState<string>("");
  const [gettingLocationOverlay, setGettingLocationOverlay] = useState<boolean>(false);

  userDetails = user;

  const getDeviceToken = async () => {
    const cachedToken = await AsyncStorage.getItem("deviceToken");
    setDeviceToken(cachedToken || "");
  };

  const showToast = (
    message: string,
    containerStyles: any = null,
    textStyles: any = null
  ) => {
    showToastMessage(message, 3000, true, containerStyles, textStyles);
  };

  const addToUnread = (roomId: string) => {
    if (unreadChats.includes(roomId)) {
      return;
    }
    setUnreadChats((prev) => [...prev, roomId]);
  };

  const removeFromUnread = (roomId: string) => {
    if (!unreadChats.includes(roomId)) {
      return;
    }
    setUnreadChats((prev) => prev.filter((m) => m !== roomId));
  };

  // Initialize auth state from storage
  useEffect(() => {
    initializeAuthState();
    getDeviceToken();
  }, []);

  const initializeAuthState = async () => {
    try {
      // Load cached auth state from MMKV
      const cachedUser = storage.getString(STORAGE_KEYS.USER);
      const cachedAuthState = storage.getString(STORAGE_KEYS.AUTH_STATE);

      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
        setIsAuthenticated(cachedAuthState === "true");
        setIsLoading(false);
      }

      // Set up Firebase auth listener
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          await handleUserAuthenticated(firebaseUser);
        } else {
          await handleUserSignedOut();
        }
        setIsLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error initializing auth state:", error);
      setIsLoading(false);
    }
  };

  const handleUserAuthenticated = async (firebaseUser: User) => {
    try {
      const userData = await updateUserData(firebaseUser.uid);
      const enhancedUser = {
        ...firebaseUser,
        ...userData,
      } as User & UserData;

      setUser(enhancedUser);
      setIsAuthenticated(true);

      // Persist to MMKV storage
      storage.set(STORAGE_KEYS.USER, JSON.stringify(enhancedUser));
      storage.set(STORAGE_KEYS.AUTH_STATE, "true");

      console.log(`User ${firebaseUser.email} has logged in.`);
    } catch (error) {
      console.error("Error handling user authentication:", error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("(auth/invalid-email)")) msg = "Invalid Email";
      if (msg.includes("(auth/invalid-credential)"))
        msg = "Invalid Credentials";
      if (msg.includes("(auth/network-request-failed)"))
        msg = "No internet connection";
      return { success: false, msg };
    }
  };

  const handleUserSignedOut = async () => {
    try {
      setUser(null);
      setIsAuthenticated(false);

      // Clear from MMKV storage
      storage.delete(STORAGE_KEYS.USER);
      storage.delete(STORAGE_KEYS.AUTH_STATE);
    } catch (error) {
      console.error("Error handling user sign out:", error);
    }
  };

  const updateUserData = async (userId: string): Promise<UserData | null> => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        return {
          username: data.username,
          userId: data.userId,
          profileUrl: data.profileUrl,
          deviceToken: data.deviceToken,
          email: data.email,
        };
      }
      return null;
    } catch (error) {
      console.error("Error updating user data:", error);
      // If offline, try to get data from storage
      const cachedUser = storage.getString(STORAGE_KEYS.USER);
      if (cachedUser) {
        const userData = JSON.parse(cachedUser) as User & UserData;
        return {
          username: userData.username,
          userId: userData.userId,
          profileUrl: userData.profileUrl,
          deviceToken: userData.deviceToken,
          email: userData.email,
        };
      }
      return null;
    }
  };

  const updateProfile = async (userData: Partial<UserData>) => {
    try {
      if (!user) throw new Error("No user logged in");

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        username: userData.username,
        profileUrl: userData.profileUrl,
      });

      // Update the local user state in the context
      setUser({ ...user, ...userData });

      return { success: true };
    } catch (error: any) {
      console.error("Error updating profile:", error);
      return { success: false, msg: error.message };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, data: response?.user };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("(auth/invalid-email)")) msg = "Invalid Email";
      if (msg.includes("(auth/invalid-credential)"))
        msg = "Invalid Credentials";
      if (msg.includes("(auth/network-request-failed)"))
        msg = "No internet connection";
      return { success: false, msg };
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      await handleUserSignedOut();
      console.log("User has been logged out.");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(`User ${response.user.email} has been created successfully.`);

      // create user data in Firestore
      const docRef = doc(db, "users", response.user.uid);
      const userData: UserData = {
        userId: response.user.uid,
        email,
        deviceToken: deviceToken,
      };

      await setDoc(docRef, userData);

      // Cache the user data immediately after signup using MMKV
      storage.set(
        STORAGE_KEYS.USER,
        JSON.stringify({
          ...response.user,
          ...userData,
        })
      );

      return { success: true, data: response?.user };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("(auth/invalid-email)")) msg = "Invalid Email";
      if (msg.includes("(auth/network-request-failed)"))
        msg = "No internet connection";
      if (msg.includes("(auth/email-already-in-use)"))
        msg = "Email Already In Use";
      return { success: false, msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        signUp,
        user,
        isAuthenticated,
        isLoading,
        updateProfile,
        resetPassword,
        showToast,
        addToUnread,
        removeFromUnread,
        unreadChats,
        setDeviceToken,
        setProfileUrlLink,
        profileUrl,
        gettingLocationOverlay,
        setGettingLocationOverlay,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
