import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // Add an error state if you want to expose it via context (optional, but good for debugging)
  const [error, setError] = useState(null); 

  const signup = async (email, password, role, userName) => {
    // Clear any previous errors on new action
    setError(null);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      name: userName,
      role: role,
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
      createdAt: new Date(),
    });
    return userCredential;
  };

  const login = (email, password) => {
    // Clear any previous errors on new action
    setError(null);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    // Clear any previous errors on new action
    setError(null);
    return signOut(auth);
  };

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
            setUserProfile(docSnap.data());
          } else {
            console.warn("User profile not found in Firestore via onSnapshot. Creating a basic one.");
            setDoc(userDocRef, {
              email: user.email,
              name: user.displayName || 'New User',
              role: 'talent',
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
              createdAt: new Date(),
            }).then(() => {
              // onSnapshot will trigger again after setDoc, so no direct setUserProfile here
            }).catch(error => {
              console.error("Error creating fallback profile:", error);
              // Consider setting an error here if you want to notify the user about fallback failure
            });
          }
          setLoading(false);
        }, (error) => {
          // This error listener is for issues with the Firestore subscription itself
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
        setError(null); // Clear errors when logging out
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
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export { AuthContext };