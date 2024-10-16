// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2lID4TBQulP8zVYgcFlyuYSyiYEgXJ80",
  authDomain: "fir-chat-fbcda.firebaseapp.com",
  projectId: "fir-chat-fbcda",
  storageBucket: "fir-chat-fbcda.appspot.com",
  messagingSenderId: "774805287783",
  appId: "1:774805287783:web:21cfb242a5b951bc45b5c2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
})


export const db = getFirestore(app);
export const usersRef = collection(db, "users");
export const roomRef = collection(db, "rooms")

