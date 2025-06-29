import React, { createContext, useContext, useState, useEffect } from 'react'; // useContext is now needed here
import { auth, db } from '../firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

// 1. Create the context
const AuthContext = createContext();

// 2. Create the custom hook to use the context
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Create the main context provider component
export function AuthContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Email/Password Signup
  const signup = async (email, password, role, userName) => {
    setError(null);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Create their user profile document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      name: userName,
      role: role,
      needsRoleSelection: false,
      bio: '',
      workExperiences: [],
      startupName: '',
      startupTagline: '',
      startupIndustry: '',
      startupWebsite: '',
      startupVision: '',
      startupStage: 'Ideation / Discovery',
      skills: [],
      portfolioLink: '',
      resumeLink: '',
      createdAt: serverTimestamp(),
    });
    return userCredential;
  };

  // Email/Password Login
  const login = (email, password) => {
    setError(null);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Google Sign-In / Sign-Up
  const signInWithGoogle = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          email: user.email,
          name: user.displayName,
          role: 'pending',
          needsRoleSelection: true,
          bio: '',
          workExperiences: [],
          startupName: '',
          startupTagline: '',
          startupIndustry: '',
          startupWebsite: '',
          startupVision: '',
          startupStage: 'Ideation / Discovery',
          skills: [],
          portfolioLink: '',
          resumeLink: '',
          createdAt: serverTimestamp(),
        });
      }
      return result;
    } catch (error) {
      setError(error.message);
      console.error("Error during Google sign-in:", error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    setError(null);
    return signOut(auth);
  };

  // Effect to manage auth state and real-time profile updates
  useEffect(() => {
    let unsubscribeUserProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setLoading(true);
        setError(null);
        const userDocRef = doc(db, 'users', user.uid);

        unsubscribeUserProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile({ id: docSnap.id, ...docSnap.data() });
          } else {
            console.warn("User profile not found in Firestore via onSnapshot.");
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user profile:", error);
          setLoading(false);
        });

      } else {
        if (unsubscribeUserProfile) {
          unsubscribeUserProfile();
          unsubscribeUserProfile = null;
        }
        setUserProfile(null);
        setLoading(false);
        setError(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserProfile) {
        unsubscribeUserProfile();
      }
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    signup,
    login,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}