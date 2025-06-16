// src/firebase.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// --- Configuración de Firebase Proporcionada por el Usuario ---
// IMPORTANTE: Para producción y seguridad, estas claves NUNCA deben estar directamente en el código
// si tu repositorio es público. Utiliza variables de entorno configuradas en tu servicio de hosting (ej: Netlify).
// Ejemplo: process.env.REACT_APP_FIREBASE_API_KEY
// Por ahora, para desarrollo y que puedas continuar, usamos los valores que proporcionaste.
const firebaseConfig = {
  apiKey: "AIzaSyBxWCfp2Jjz1_-exXQvJn-yVZ9A04admZs", // ¡Considera usar variables de entorno!
  authDomain: "fittrackapp-f0b62.firebaseapp.com",
  projectId: "fittrackapp-f0b62",
  storageBucket: "fittrackapp-f0b62.appspot.com", // Corregido: suele ser .appspot.com
  messagingSenderId: "77621653447",
  appId: "1:77621653447:web:c6bdfdb70371e49c11f3e2"
};

// Inicializar Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase initialized successfully with user-provided config.");
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Fallback o manejo de errores si la inicialización falla.
  // Por simplicidad, lanzamos un error para que sea claro que la inicialización falló.
  throw new Error("No se pudo inicializar Firebase. Por favor, verifica tu configuración.");
}

export { app, auth, db };
