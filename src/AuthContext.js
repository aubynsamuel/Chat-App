import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../env/firebaseConfig";
import { deviceToken } from "./services/ExpoPushNotifications";
import storage from "./Functions/Storage";

// Create Authentication Context
const AuthContext = createContext();

// Create Authentication Context hooks and exports
export const useAuth = () => useContext(AuthContext);

// Constants for storage keys
const STORAGE_KEYS = {
  USER: "user_data",
  AUTH_STATE: "auth_state",
};

export let userDetails
// Create Authentication Context Provider
export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  userDetails = user
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 2800);
  };

  // Initialize auth state from storage
  useEffect(() => {
    initializeAuthState();
  }, []);

  const initializeAuthState = async () => {
    try {
      // Load cached auth state from MMKV
      const cachedUser = storage.getString(STORAGE_KEYS.USER);
      const cachedAuthState = storage.getString(STORAGE_KEYS.AUTH_STATE);

      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
        setIsAuthenticated(cachedAuthState === "true");
        setIsLoading(false)
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

  const handleUserAuthenticated = async (firebaseUser) => {
    try {
      const userData = await updateUserData(firebaseUser.uid);
      const enhancedUser = {
        ...firebaseUser,
        ...userData,
      };

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

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
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

  const updateUserData = async (userId) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          username: data.username,
          userId: data.userId,
          profileUrl: data.profileUrl,
          deviceToken: data.deviceToken,
        };
      }
      return null;
    } catch (error) {
      console.error("Error updating user data:", error);
      // If offline, try to get data from storage
      const cachedUser = storage.getString(STORAGE_KEYS.USER);
      if (cachedUser) {
        const userData = JSON.parse(cachedUser);
        return {
          username: userData.username,
          userId: userData.userId,
          profileUrl: userData.profileUrl,
          deviceToken: userData.deviceToken,
        };
      }
      return null;
    }
  };

  const updateProfile = async (userData) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        username: userData.username,
        profileUrl: userData.profileUrl,
      });

      // Update the local user state in the context
      setUser({ ...user, ...userData });

      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, msg: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, data: response?.user };
    } catch (error) {
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

  const signUp = async (email, username, password, profileUrl) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
        profileUrl
      );
      console.log(`User ${response.user.email} has been created successfully.`);

      // update user data in Firestore
      const docRef = doc(db, "users", response.user.uid);
      const userData = {
        username,
        userId: response.user.uid,
        email,
        profileUrl,
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
    } catch (error) {
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
        toastMessage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
