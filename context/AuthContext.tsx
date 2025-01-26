import { createContext, useContext, useEffect, useState } from "react";
import storage from "../Functions/Storage";
import { showToast as showToastMessage } from "@/components/Toast";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

export let userDetails: UserData | null;

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
  ) => Promise<{
    success: boolean;
    data?: FirebaseAuthTypes.User;
    msg?: string;
  }>;
  logout: () => Promise<void>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    data?: FirebaseAuthTypes.User;
    msg?: string;
  }>;
  user: UserData | null;
  isAuthenticated: boolean | undefined;
  isLoading: boolean;
  updateProfile: (
    userData: Partial<UserData>
  ) => Promise<{ success: boolean; msg?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; msg?: string }>;
  showToast: (message: string, containerStyles?: any, textStyles?: any) => void;
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

  userDetails = user;

  const showToast = (
    message: string,
    containerStyles: any = null,
    textStyles: any = null
  ) => {
    showToastMessage(message, 3000, true, containerStyles, textStyles);
  };

  // Initialize auth state from storage
  useEffect(() => {
    initializeAuthState();
  }, []);

  const initializeAuthState = async () => {
    try {
      // Load cached user and auth state from MMKV
      const cachedUser = storage.getString(STORAGE_KEYS.USER);
      const cachedAuthState = storage.getString(STORAGE_KEYS.AUTH_STATE);

      if (cachedUser && cachedAuthState) {
        setUser(JSON.parse(cachedUser));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);

      // authenticate and update userDetails
      const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          await handleUserAuthentication(firebaseUser);
          console.log("User authenticated:", firebaseUser.email);
        } else {
          await handleUserSignedOut();
          console.log("User signed out.");
        }
        setIsLoading(false);
      });

      return unsubscribe();
    } catch (error) {
      console.error("Error initializing auth state:", error);
      setIsLoading(false);
    }
  };

  const handleUserAuthentication = async (
    firebaseUser: FirebaseAuthTypes.User
  ) => {
    try {
      const userData = await updateUserData(firebaseUser.uid);
      const enhancedUser = {
        ...firebaseUser,
        ...userData,
      } as FirebaseAuthTypes.User & UserData;

      setUser(enhancedUser);
      setIsAuthenticated(true);

      // Persist to MMKV storage
      storage.set(STORAGE_KEYS.USER, JSON.stringify(enhancedUser));
      storage.set(STORAGE_KEYS.AUTH_STATE, "true");

      // console.log(`User ${firebaseUser.email} has logged in.`);
    } catch (error) {
      console.error("Error handling user authentication:", error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await auth().sendPasswordResetEmail(email);
      return { success: true };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("auth/invalid-email")) msg = "Invalid Email";
      if (msg.includes("auth/invalid-credential")) msg = "Invalid Credentials";
      if (msg.includes("auth/network-request-failed"))
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
      const docRef = firestore().collection("users").doc(userId);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        const data = docSnap.data() as UserData;
        console.log("Fetched user data from Firestore:", data.email);
        return {
          username: data.username,
          userId: data.userId,
          profileUrl: data.profileUrl,
          deviceToken: data.deviceToken,
          email: data.email,
        };
      }
      console.warn("User document not found in Firestore for ID:", userId);
      return null;
    } catch (error) {
      console.error("Error updating user data:", error);
      return null;
    }
  };

  const updateProfile = async (userData: Partial<UserData>) => {
    try {
      if (!user) throw new Error("No user logged in");

      const userDocRef = firestore().collection("users").doc(user.userId);
      await userDocRef.update({
        username: userData.username,
        profileUrl: userData.profileUrl || null,
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
      const response = await auth().signInWithEmailAndPassword(email, password);
      console.log("Login successful:", response.user.email);
      await handleUserAuthentication(response.user); // Ensure state updates after login
      return { success: true, data: response.user };
    } catch (error: any) {
      console.error("Login failed:", error);
      let msg = error.message;
      if (msg.includes("auth/invalid-email")) msg = "Invalid Email";
      if (msg.includes("auth/invalid-credential")) msg = "Invalid Credentials";
      if (msg.includes("auth/network-request-failed"))
        msg = "No internet connection";
      return { success: false, msg };
    }
  };

  const logout = async () => {
    try {
      await auth().signOut();
      await handleUserSignedOut();
      console.log("User has been logged out.");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      console.log(`User ${response.user.email} has been created successfully.`);

      // Create user data in Firestore
      const docRef = firestore().collection("users").doc(response.user.uid);
      const userData: UserData = {
        userId: response.user.uid,
        email,
        deviceToken: "",
      };
      await docRef.set(userData);

      // Automatically log in the user
      await handleUserAuthentication(response.user);

      return { success: true, data: response.user };
    } catch (error: any) {
      console.error("Signup failed:", error.code, error.message);
      let msg = error.message;
      if (msg.includes("auth/invalid-email")) msg = "Invalid Email";
      if (msg.includes("auth/network-request-failed"))
        msg = "No internet connection";
      if (msg.includes("auth/email-already-in-use"))
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
