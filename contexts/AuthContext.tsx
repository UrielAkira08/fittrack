import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { auth, db } from '../firebase'; // Firebase setup
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser // Firebase Auth User type
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { User, UserRole } from '../types'; // Your app's User type

interface AuthContextType {
  user: User | null; // Your app's User type (includes role, name, email, uid as id)
  firebaseUser: FirebaseUser | null; // Raw Firebase Auth user
  loading: boolean;
  login: (email: string, password_provided: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  // createUser function might be added here or in DataContext if AuthContext is only for current user state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        // Fetch app-specific user profile from Firestore
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({
              id: fbUser.uid, // Firebase UID
              email: fbUser.email || userData.email, // Prefer fbUser.email, fallback to stored
              name: userData.name,
              role: userData.role as UserRole,
            });
          } else {
            console.warn(`No user profile found in Firestore for UID: ${fbUser.uid}. Logging out.`);
            // This case might happen if user was created in Auth but not in Firestore, or data inconsistency
            await firebaseSignOut(auth); // Force logout
            setUser(null);
            setFirebaseUser(null);
          }
        } catch (error) {
            console.error("Error fetching user profile from Firestore:", error);
            await firebaseSignOut(auth); // Force logout on error
            setUser(null);
            setFirebaseUser(null);
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const login = async (email: string, password_provided: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password_provided);
      // onAuthStateChanged will handle setting user and firebaseUser state
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      // Firebase provides error codes and messages
      let friendlyMessage = 'Error de inicio de sesión. Verifica tus credenciales.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        friendlyMessage = 'Correo electrónico o contraseña incorrectos.';
      } else if (error.code === 'auth/invalid-email') {
        friendlyMessage = 'El formato del correo electrónico no es válido.';
      }
      console.error("Firebase login error:", error.code, error.message);
      return { success: false, message: friendlyMessage };
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle setting user and firebaseUser to null
    } catch (error) {
      console.error("Firebase logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
