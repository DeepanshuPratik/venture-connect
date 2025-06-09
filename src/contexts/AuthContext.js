import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Stores user's Firestore profile
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, role, userName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      name: userName,
      role: role,
      bio: '',
      previousTrack: [],
      skills: [],
      startupVision: '',
      startupStage: 'Ideation / Discovery', // Default stage
      startupType: role === 'entrepreneur' ? '' : undefined, // Initialize startupType for entrepreneurs
      createdAt: new Date(),
    });
    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          console.warn("User profile not found in Firestore. Creating a basic one.");
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            name: user.displayName || 'New User',
            role: 'talent',
            bio: '',
            previousTrack: [],
            skills: [],
            startupVision: '',
            startupStage: 'Ideation / Discovery',
            startupType: undefined, // Default for non-entrepreneur if not found
            createdAt: new Date(),
          });
          const newDocSnap = await getDoc(docRef);
          setUserProfile(newDocSnap.data());
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export { AuthContext };