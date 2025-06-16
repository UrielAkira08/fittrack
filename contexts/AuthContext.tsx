
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
}

// Export the context object itself
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        console.log(`[AuthContext] Auth state changed. Firebase User: ${fbUser.uid}, Email: ${fbUser.email}`);
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log(`[AuthContext] Firestore user data for ${fbUser.uid}:`, JSON.stringify(userData));
            
            const userRoleFromFirestore = userData.role as UserRole;
            console.log(`[AuthContext] Role from Firestore for ${fbUser.uid}: '${userRoleFromFirestore}'`);

            // Expect 'name' (English) field from Firestore now
            if (!userData.name || !userData.role) { 
              console.error(`[AuthContext] Firestore document for ${fbUser.uid} is missing 'name' or 'role'. UserData:`, userData);
              await firebaseSignOut(auth); 
              setUser(null);
              setFirebaseUser(null);
            } else {
              setUser({
                id: fbUser.uid,
                email: fbUser.email || userData.email, 
                name: userData.name, // Use 'name' (English)
                role: userRoleFromFirestore,
              });
              console.log(`[AuthContext] App user state set for ${fbUser.uid} with role '${userRoleFromFirestore}' and name '${userData.name}'`);
            }
          } else {
            console.warn(`[AuthContext] No user profile found in Firestore for UID: ${fbUser.uid}. Logging out user from app.`);
            await firebaseSignOut(auth); 
            setUser(null);
            setFirebaseUser(null);
          }
        } catch (error) {
            console.error("[AuthContext] Error fetching user profile from Firestore:", error);
            await firebaseSignOut(auth); 
            setUser(null);
            setFirebaseUser(null);
        }
      } else {
        console.log("[AuthContext] Auth state changed. No Firebase user.");
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe(); 
  }, []);

  const login = async (email: string, password_provided: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    console.log(`[AuthContext] Attempting login for email: ${email}`);
    try {
      await signInWithEmailAndPassword(auth, email, password_provided);
      console.log(`[AuthContext] Firebase signInWithEmailAndPassword successful for ${email}. Waiting for onAuthStateChanged.`);
      // setLoading(false); // setLoading will be handled by onAuthStateChanged
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      let friendlyMessage = 'Error de inicio de sesión. Verifica tus credenciales.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        friendlyMessage = 'Correo electrónico o contraseña incorrectos.';
      } else if (error.code === 'auth/invalid-email') {
        friendlyMessage = 'El formato del correo electrónico no es válido.';
      }
      console.error("[AuthContext] Firebase login error:", error.code, error.message);
      return { success: false, message: friendlyMessage };
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    console.log("[AuthContext] Attempting logout.");
    try {
      await firebaseSignOut(auth);
      console.log("[AuthContext] Firebase signOut successful. Waiting for onAuthStateChanged.");
      // setUser(null) and setFirebaseUser(null) will be handled by onAuthStateChanged
    } catch (error) {
      console.error("[AuthContext] Firebase logout error:", error);
    } finally {
      // setLoading(false); // setLoading will be handled by onAuthStateChanged
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
