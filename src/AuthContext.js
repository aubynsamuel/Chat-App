import {createContext, useContext, useEffect, useState} from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {doc, getDoc, setDoc} from 'firebase/firestore';
import {auth, db} from '../firebaseConfig';


// Create Authentication Context
const AuthContext = createContext();

// Create Authentication Provider
export const useAuth = () => useContext(AuthContext);

// Create Authentication Context Provider
export const AuthContextProvider = ({children}) => {
  
  // console.log(lastMessage, "from AuthContext")

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUser(user);

        console.log(`User ${user.email} has logged in.`);
        setIsAuthenticated(true);
        updateUserData(user.uid);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });
    return unsubscribe;
  }, []);

  // update user data in Firestore
  const updateUserData = async userId => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        let data = docSnap.data();
        setUser({
          ...user,
          username: data.username,
          userId: data.userId,
          profileUrl: data.profileUrl,
        });
      }
    } catch (e) {}
  };

  // login logic
  const login = async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      // console.log(`User ${response.user.email} has been logged in.`);
      return {success: true, data: response?.user};
    } catch (e) {
      let msg = e.message;
      if (msg.includes('(auth/invalid-email)')) msg = 'Invalid Email';
      if (msg.includes('(auth/invalid-credential)'))
        msg = 'Invalid Credentials';
      return {success: false, msg};
    }
  };

  // logout logic
  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      console.log('User has been logged out.');
    } catch (e) {}
  };

  // Sign up logic
  const signUp = async (email, username, password, profileUrl) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
        profileUrl,
      );
      console.log(`User ${response.user.email} has been created successfully.`);

      // update user data in Firestore
      const docRef = doc(db, 'users', response.user.uid);
      await setDoc(docRef, {
        username,
        userId: response.user.uid,
        email,
        profileUrl,
      });
      return {success: true, data: response?.user};
    } catch (e) {
      let msg = e.message;
      if (msg.includes('(auth/invalid-email)')) msg = 'Invalid Email';
      if (msg.includes('(auth/email-already-in-use)'))
        msg = 'Email Already In Use';
      return {success: false, msg};
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
      }}>
      {children}
    </AuthContext.Provider>
  );
};
