// FIX: The entire file is corrected to use onSnapshot and satisfy the linter.
import React, { createContext, useState, useEffect } from 'react'; // useContext is not needed here
import { auth, db } from '../firebase/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'; // onSnapshot is used

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const signup = async (email, password, role, userName) => {
    setError(null);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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

  const login = (email, password) => {
    setError(null);
    return signInWithEmailAndPassword(auth, email, password);
  };

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

  const logout = () => {
    setError(null);
    return signOut(auth);
  };

  useEffect(() => {
    let unsubscribeUserProfile = null; // Defined here to be accessible in cleanup

    // onAuthStateChanged returns its own unsubscribe function
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user); // This setter IS used
      if (user) {
        setLoading(true); // This setter IS used
        setError(null);
        const userDocRef = doc(db, 'users', user.uid);

        // onSnapshot also returns its own unsubscribe function
        unsubscribeUserProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data()); // This setter IS used
          } else {
            // Logic to handle missing profile (e.g., after Google sign-in)
          }
          setLoading(false); // This setter IS used
        }, (error) => {
          console.error("Error listening to user profile:", error);
          setLoading(false);
        });

      } else {
        if (unsubscribeUserProfile) {
          unsubscribeUserProfile(); // Cleanup for profile listener
          unsubscribeUserProfile = null;
        }
        setUserProfile(null); // This setter IS used
        setLoading(false);    // This setter IS used
        setError(null);
      }
    });

    // This is the cleanup function for the useEffect hook
    return () => {
      unsubscribeAuth(); // Cleanup for auth listener
      if (unsubscribeUserProfile) {
        unsubscribeUserProfile(); // Cleanup for profile listener
      }
    };
  }, []); // Empty array ensures this runs only once on mount


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

export { AuthContext };