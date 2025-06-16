import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { db, auth } from '../firebase'; // Firebase setup
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  Timestamp,
  serverTimestamp,
  orderBy,
  limit,
  runTransaction,
  setDoc // Added setDoc import
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { User, UserRole, Routine, ClientProfile, BodyWeightLog, BodyMeasurementsLog, ExerciseProgressLog, RoutineType, Exercise } from '../types';
import { useAuth } from './AuthContext'; // To get current user UID
import { v4 as uuidv4 } from 'uuid'; // For exercise IDs within routines

interface DataContextType {
  // States for fetched data
  routines: Routine[];
  clientProfiles: ClientProfile[];
  coaches: User[]; // Only relevant for SuperCoach
  bodyWeightLogs: Record<string, BodyWeightLog[]>; 
  bodyMeasurementLogs: Record<string, BodyMeasurementsLog[]>;
  exerciseProgressLogs: Record<string, ExerciseProgressLog[]>;
  
  isLoading: boolean; // General loading state for DataContext
  isFetchingRoutines: boolean;
  isFetchingClients: boolean;
  // ... other specific loading states if needed

  // Routine methods
  addRoutine: (routineData: Omit<Routine, 'id' | 'createdBy' | 'createdAt'>, creatorId: string) => Promise<Routine | null>;
  updateRoutine: (routineId: string, routineData: Partial<Omit<Routine, 'id' | 'createdBy'>>) => Promise<void>;
  deleteRoutine: (routineId: string) => Promise<void>;
  getRoutineById: (routineId: string) => Routine | undefined; // Will get from local state
  getCoachRoutines: (coachId: string) => Routine[]; // From local state
  getAllRoutines: () => Routine[]; // From local state, for SuperCoach

  // User/Client/Coach methods
  addClient: (clientDetails: { name: string; email: string; initialPassword_plain: string }, coachId: string) => Promise<ClientProfile | null>;
  getClientById: (clientId: string) => ClientProfile | undefined; // From local state
  getCoachClients: (coachId: string) => ClientProfile[]; // From local state
  getAllClients: () => ClientProfile[]; // From local state, for SuperCoach
  assignRoutineToClient: (clientId: string, routineId: string) => Promise<void>;
  unassignRoutineFromClient: (clientId: string, routineId: string) => Promise<void>;
  getClientAssignedRoutines: (clientId: string) => Routine[]; // From local state, uses routines state

  addCoach: (coachDetails: { name: string; email: string; initialPassword_plain: string }, superCoachId: string) => Promise<User | null>;
  getAllCoaches: () => User[]; // From local state

  // Progress Log methods
  addBodyWeightLog: (clientId: string, logData: Omit<BodyWeightLog, 'id' | 'clientId'>) => Promise<void>;
  getClientBodyWeightLogs: (clientId: string) => BodyWeightLog[]; // From local state
  
  addBodyMeasurementsLog: (clientId: string, logData: Omit<BodyMeasurementsLog, 'id' | 'clientId'>) => Promise<void>;
  getClientBodyMeasurementsLogs: (clientId: string) => BodyMeasurementsLog[]; // From local state
  
  addExerciseProgressLog: (clientId: string, logData: Omit<ExerciseProgressLog, 'id' | 'clientId'>) => Promise<void>;
  getClientExerciseProgressLogs: (clientId: string, routineId?: string) => ExerciseProgressLog[]; // From local state
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser, loading: authLoading } = useAuth();
  
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [clientProfiles, setClientProfiles] = useState<ClientProfile[]>([]);
  const [coaches, setCoaches] = useState<User[]>([]);
  
  const [bodyWeightLogs, setBodyWeightLogs] = useState<Record<string, BodyWeightLog[]>>({});
  const [bodyMeasurementLogs, setBodyMeasurementLogs] = useState<Record<string, BodyMeasurementsLog[]>>({});
  const [exerciseProgressLogs, setExerciseProgressLogs] = useState<Record<string, ExerciseProgressLog[]>>({});

  const [isLoading, setIsLoading] = useState(true); // General loading
  const [isFetchingRoutines, setIsFetchingRoutines] = useState(true);
  const [isFetchingClients, setIsFetchingClients] = useState(true);
  const [isFetchingCoaches, setIsFetchingCoaches] = useState(true);
  const [isFetchingLogs, setIsFetchingLogs] = useState(true);


  // Fetch data when user is authenticated
  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }
    if (!authUser) {
      // Clear data if user logs out
      setRoutines([]);
      setClientProfiles([]);
      setCoaches([]);
      setBodyWeightLogs({});
      setBodyMeasurementLogs({});
      setExerciseProgressLogs({});
      setIsLoading(false);
      setIsFetchingRoutines(false);
      setIsFetchingClients(false);
      setIsFetchingCoaches(false);
      setIsFetchingLogs(false);
      return;
    }

    // User is authenticated, fetch data based on role
    setIsLoading(true);
    const fetchData = async () => {
      try {
        // Fetch Routines
        setIsFetchingRoutines(true);
        if (authUser.role === UserRole.SUPER_COACH) {
          const routinesQuery = query(collection(db, 'routines'), orderBy('createdAt', 'desc'));
          const routinesSnapshot = await getDocs(routinesQuery);
          setRoutines(routinesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Routine)));
        } else if (authUser.role === UserRole.COACH) {
          const routinesQuery = query(collection(db, 'routines'), where('createdBy', '==', authUser.id), orderBy('createdAt', 'desc'));
          const routinesSnapshot = await getDocs(routinesQuery);
          setRoutines(routinesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Routine)));
        } else if (authUser.role === UserRole.CLIENT) {
            // Optimized routine fetching for clients
            const clientDocRef = doc(db, 'clientProfiles', authUser.id);
            const clientDocSnap = await getDoc(clientDocRef);
            if (clientDocSnap.exists()) {
                const clientData = clientDocSnap.data() as ClientProfile;
                if (clientData.assignedRoutineIds && clientData.assignedRoutineIds.length > 0) {
                    // Firestore 'in' query supports up to 30 elements.
                    // For more, multiple queries or individual getDoc calls in batches would be needed.
                    const routineIdsToFetch = clientData.assignedRoutineIds.slice(0, 30); 
                    if (routineIdsToFetch.length > 0) {
                        const routinesQuery = query(collection(db, 'routines'), where('__name__', 'in', routineIdsToFetch));
                        const routinesSnapshot = await getDocs(routinesQuery);
                        const fetchedRoutines = routinesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Routine));
                        setRoutines(fetchedRoutines);
                    } else {
                        setRoutines([]); // No valid IDs to fetch
                    }
                } else {
                    setRoutines([]); // No routines assigned
                }
            } else {
                 setRoutines([]); // No client profile found
            }
        }
        setIsFetchingRoutines(false);
        
        // Fetch ClientProfiles
        setIsFetchingClients(true);
        if (authUser.role === UserRole.SUPER_COACH) {
          const clientsSnapshot = await getDocs(collection(db, 'clientProfiles'));
          setClientProfiles(clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientProfile)));
        } else if (authUser.role === UserRole.COACH) {
          const clientsSnapshot = await getDocs(query(collection(db, 'clientProfiles'), where('coachId', '==', authUser.id)));
          setClientProfiles(clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientProfile)));
        } else if (authUser.role === UserRole.CLIENT) {
          // Client fetches their own profile (already fetched for routines, could optimize to not fetch twice if not needed)
          const clientDocRef = doc(db, 'clientProfiles', authUser.id);
          const clientDocSnap = await getDoc(clientDocRef);
          if (clientDocSnap.exists()) {
            setClientProfiles([{ id: clientDocSnap.id, ...clientDocSnap.data() } as ClientProfile]);
          } else {
            setClientProfiles([]); // Client profile might not exist yet
          }
        }
        setIsFetchingClients(false);

        // Fetch Coaches (only for SuperCoach)
        setIsFetchingCoaches(true);
        if (authUser.role === UserRole.SUPER_COACH) {
          const coachesSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', UserRole.COACH)));
          setCoaches(coachesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        }
        setIsFetchingCoaches(false);

        // Fetch Logs (for current client, or all clients if coach/SC)
        // This part can be extensive. For now, let's keep it simple: fetch only if user is client.
        // Coaches/SC would fetch logs on demand when viewing a specific client.
        setIsFetchingLogs(true);
        if (authUser.role === UserRole.CLIENT) {
            const bwLogsQuery = query(collection(db, `users/${authUser.id}/bodyWeightLogs`), orderBy('date', 'desc'));
            const bmLogsQuery = query(collection(db, `users/${authUser.id}/bodyMeasurementLogs`), orderBy('date', 'desc'));
            const exLogsQuery = query(collection(db, `users/${authUser.id}/exerciseProgressLogs`), orderBy('date', 'desc'));

            const [bwSnapshot, bmSnapshot, exSnapshot] = await Promise.all([
                getDocs(bwLogsQuery),
                getDocs(bmLogsQuery),
                getDocs(exLogsQuery)
            ]);
            
            setBodyWeightLogs({[authUser.id]: bwSnapshot.docs.map(d => ({id: d.id, clientId: authUser.id, ...d.data()} as BodyWeightLog))});
            setBodyMeasurementLogs({[authUser.id]: bmSnapshot.docs.map(d => ({id: d.id, clientId: authUser.id, ...d.data()} as BodyMeasurementsLog))});
            setExerciseProgressLogs({[authUser.id]: exSnapshot.docs.map(d => ({id: d.id, clientId: authUser.id, ...d.data()} as ExerciseProgressLog))});
        }
        setIsFetchingLogs(false);

      } catch (error) {
        console.error("Error fetching initial data:", error);
        // Set all fetching states to false on error
        setIsFetchingRoutines(false);
        setIsFetchingClients(false);
        setIsFetchingCoaches(false);
        setIsFetchingLogs(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [authUser, authLoading]);


  // Helper to get logs for a client (used by Coach/SC when viewing a client's progress)
  // This is an example of on-demand fetching.
  const fetchClientLogsIfNeeded = async (clientId: string) => {
    if (!bodyWeightLogs[clientId] || !bodyMeasurementLogs[clientId] || !exerciseProgressLogs[clientId]) {
        setIsFetchingLogs(true);
        try {
            const bwLogsQuery = query(collection(db, `users/${clientId}/bodyWeightLogs`), orderBy('date', 'desc'));
            const bmLogsQuery = query(collection(db, `users/${clientId}/bodyMeasurementLogs`), orderBy('date', 'desc'));
            const exLogsQuery = query(collection(db, `users/${clientId}/exerciseProgressLogs`), orderBy('date', 'desc'));

            const [bwSnapshot, bmSnapshot, exSnapshot] = await Promise.all([
                getDocs(bwLogsQuery),
                getDocs(bmLogsQuery),
                getDocs(exLogsQuery)
            ]);
            
            setBodyWeightLogs(prev => ({...prev, [clientId]: bwSnapshot.docs.map(d => ({id: d.id, clientId, ...d.data()} as BodyWeightLog))}));
            setBodyMeasurementLogs(prev => ({...prev, [clientId]: bmSnapshot.docs.map(d => ({id: d.id, clientId, ...d.data()} as BodyMeasurementsLog))}));
            setExerciseProgressLogs(prev => ({...prev, [clientId]: exSnapshot.docs.map(d => ({id: d.id, clientId, ...d.data()} as ExerciseProgressLog))}));
        } catch (error) {
            console.error(`Error fetching logs for client ${clientId}:`, error);
        } finally {
            setIsFetchingLogs(false);
        }
    }
  };


  // --- Routines ---
  const addRoutine = async (routineData: Omit<Routine, 'id' | 'createdBy' | 'createdAt'>, creatorId: string): Promise<Routine | null> => {
    try {
      const newRoutineData = { 
        ...routineData, 
        createdBy: creatorId, 
        createdAt: serverTimestamp(),
        exercises: routineData.exercises.map(ex => ({...ex, id: ex.id || uuidv4() })) // Ensure exercise IDs
      };
      const docRef = await addDoc(collection(db, 'routines'), newRoutineData);
      const newRoutine = { ...newRoutineData, id: docRef.id, createdAt: Timestamp.now() } as Routine; // Approximate createdAt for local state
      setRoutines(prev => [newRoutine, ...prev]);
      return newRoutine;
    } catch (error) {
      console.error("Error adding routine:", error);
      return null;
    }
  };

  const updateRoutine = async (routineId: string, routineData: Partial<Omit<Routine, 'id' | 'createdBy'>>) => {
    try {
      const routineRef = doc(db, 'routines', routineId);
      await updateDoc(routineRef, routineData);
      setRoutines(prev => prev.map(r => r.id === routineId ? { ...r, ...routineData } as Routine : r));
    } catch (error) {
      console.error("Error updating routine:", error);
    }
  };

  const deleteRoutine = async (routineId: string) => {
    try {
      await deleteDoc(doc(db, 'routines', routineId));
      setRoutines(prev => prev.filter(r => r.id !== routineId));
      // Also unassign this routine from all clients (might need a batch write or cloud function for larger scale)
      const updatedClientProfiles = clientProfiles.map(cp => ({
          ...cp,
          assignedRoutineIds: cp.assignedRoutineIds.filter(id => id !== routineId)
      }));
      setClientProfiles(updatedClientProfiles); // Local update
      // Firestore update for client profiles (example for one client, needs iteration for all)
      // This is complex and might be better handled server-side or with more targeted client updates.
      // For now, only local state of clientProfiles is updated for assignedRoutineIds.
      // A full solution would query clients with this routineId and update them.
    } catch (error) {
      console.error("Error deleting routine:", error);
    }
  };
  
  const getRoutineById = (routineId: string) => routines.find(r => r.id === routineId);
  const getCoachRoutines = (coachId: string) => routines.filter(r => r.createdBy === coachId);
  const getAllRoutines = () => routines;

  // --- Users (Coaches & Clients) ---
  const _createUserInFirestore = async (uid: string, email: string, name: string, role: UserRole) => {
    await setDoc(doc(db, 'users', uid), { uid, email, name, role, createdAt: serverTimestamp() });
  };

  const addCoach = async (coachDetails: { name: string; email: string; initialPassword_plain: string }, superCoachId: string): Promise<User | null> => {
    try {
      // Check if email already exists in 'users' collection (optional, Firebase Auth also checks)
      const userQuery = query(collection(db, 'users'), where('email', '==', coachDetails.email));
      const querySnapshot = await getDocs(userQuery);
      if (!querySnapshot.empty) {
        console.error("User with this email already exists in Firestore.");
        alert("Este correo electrónico ya está registrado.");
        return null;
      }
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, coachDetails.email, coachDetails.initialPassword_plain);
      const newCoachUID = userCredential.user.uid;

      // Create user profile in Firestore
      const newCoachUser: User = {
        id: newCoachUID,
        email: coachDetails.email,
        name: coachDetails.name,
        role: UserRole.COACH
      };
      await setDoc(doc(db, 'users', newCoachUID), { ...newCoachUser, uid: newCoachUID, createdAt: serverTimestamp() }); // uid field explicitly added
      
      setCoaches(prev => [newCoachUser, ...prev]);
      return newCoachUser;
    } catch (error: any) {
      console.error("Error adding coach:", error);
      if (error.code === 'auth/email-already-in-use') {
        alert('Este correo electrónico ya está registrado en autenticación.');
      } else {
        alert('Error al crear el entrenador.');
      }
      return null;
    }
  };

  const getAllCoaches = () => coaches;

  const addClient = async (clientDetails: { name: string; email: string; initialPassword_plain: string }, coachId: string): Promise<ClientProfile | null> => {
     try {
        // Check if email already exists in 'users' collection
        const userQuery = query(collection(db, 'users'), where('email', '==', clientDetails.email));
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
            // Check if existing user is already a client or different role
            const existingUserData = querySnapshot.docs[0].data();
            if (existingUserData.role === UserRole.CLIENT) {
                 alert("Este cliente ya existe."); return null;
            } else if (existingUserData.role !== UserRole.CLIENT) {
                alert("Este correo electrónico ya está registrado con un rol diferente."); return null;
            }
        }

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, clientDetails.email, clientDetails.initialPassword_plain);
        const newClientUID = userCredential.user.uid;

        // Create user profile in Firestore 'users' collection
        const newClientUserForUsersCollection: User = {
            id: newClientUID,
            email: clientDetails.email,
            name: clientDetails.name,
            role: UserRole.CLIENT
        };
        // Explicitly add uid field to the document, and coachId for client users.
        await setDoc(doc(db, 'users', newClientUID), { ...newClientUserForUsersCollection, uid: newClientUID, coachId, createdAt: serverTimestamp() }); 
        
        // Create client profile in Firestore 'clientProfiles' collection
        const newClientProfile: ClientProfile = {
            id: newClientUID, // UID
            coachId: coachId, // Coach's UID
            name: clientDetails.name,
            email: clientDetails.email,
            assignedRoutineIds: []
        };
        await setDoc(doc(db, 'clientProfiles', newClientUID), { ...newClientProfile, uid: newClientUID, createdAt: serverTimestamp() }); // Add uid and createdAt
        
        setClientProfiles(prev => [{...newClientProfile, id: newClientUID}, ...prev]);
        return {...newClientProfile, id: newClientUID};
    } catch (error: any) {
        console.error("Error adding client:", error);
        if (error.code === 'auth/email-already-in-use') {
            alert('Este correo electrónico ya está registrado en autenticación.');
        } else {
            alert('Error al crear el cliente.');
        }
        return null;
    }
  };
  
  const getClientById = (clientId: string) => clientProfiles.find(c => c.id === clientId);
  const getCoachClients = (coachId: string) => clientProfiles.filter(c => c.coachId === coachId);
  const getAllClients = () => clientProfiles;
  
  const assignRoutineToClient = async (clientId: string, routineId: string) => {
    try {
      const clientRef = doc(db, 'clientProfiles', clientId);
      const clientSnap = await getDoc(clientRef);
      if (clientSnap.exists()) {
        const clientData = clientSnap.data() as ClientProfile;
        const newAssignedIds = Array.from(new Set([...clientData.assignedRoutineIds, routineId]));
        await updateDoc(clientRef, { assignedRoutineIds: newAssignedIds });
        setClientProfiles(prev => prev.map(cp => cp.id === clientId ? { ...cp, assignedRoutineIds: newAssignedIds } : cp));
      }
    } catch (error) {
      console.error("Error assigning routine:", error);
    }
  };

  const unassignRoutineFromClient = async (clientId: string, routineId: string) => {
    try {
      const clientRef = doc(db, 'clientProfiles', clientId);
      const clientSnap = await getDoc(clientRef);
      if (clientSnap.exists()) {
        const clientData = clientSnap.data() as ClientProfile;
        const newAssignedIds = clientData.assignedRoutineIds.filter(id => id !== routineId);
        await updateDoc(clientRef, { assignedRoutineIds: newAssignedIds });
        setClientProfiles(prev => prev.map(cp => cp.id === clientId ? { ...cp, assignedRoutineIds: newAssignedIds } : cp));
      }
    } catch (error) {
      console.error("Error unassigning routine:", error);
    }
  };

  const getClientAssignedRoutines = (clientId: string): Routine[] => {
    const clientProfile = getClientById(clientId);
    if (!clientProfile || !clientProfile.assignedRoutineIds) return [];
    // Filter the main routines state based on IDs in clientProfile
    return routines.filter(r => clientProfile.assignedRoutineIds.includes(r.id));
  };

  // --- Progress Logs ---
  // Store logs in a subcollection under the user: users/{userId}/[logType]/{logId}
  const addBodyWeightLog = async (clientId: string, logData: Omit<BodyWeightLog, 'id' | 'clientId'>) => {
    try {
      const logCollectionRef = collection(db, `users/${clientId}/bodyWeightLogs`);
      const fullLogData = { ...logData, clientId, createdAt: serverTimestamp() };
      const docRef = await addDoc(logCollectionRef, fullLogData);
      const newLog = { ...fullLogData, id: docRef.id, createdAt: Timestamp.now() } as BodyWeightLog;
      setBodyWeightLogs(prev => ({ ...prev, [clientId]: [...(prev[clientId] || []), newLog].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())}));
    } catch (error) {
      console.error("Error adding body weight log:", error);
    }
  };
  const getClientBodyWeightLogs = (clientId: string) => {
    fetchClientLogsIfNeeded(clientId); // Ensure logs are fetched if not present
    return bodyWeightLogs[clientId] || [];
  }

  const addBodyMeasurementsLog = async (clientId: string, logData: Omit<BodyMeasurementsLog, 'id' | 'clientId'>) => {
     try {
      const logCollectionRef = collection(db, `users/${clientId}/bodyMeasurementLogs`);
      const fullLogData = { ...logData, clientId, createdAt: serverTimestamp() };
      const docRef = await addDoc(logCollectionRef, fullLogData);
      const newLog = { ...fullLogData, id: docRef.id, createdAt: Timestamp.now() } as BodyMeasurementsLog;
      setBodyMeasurementLogs(prev => ({ ...prev, [clientId]: [...(prev[clientId] || []), newLog].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())}));
    } catch (error) {
      console.error("Error adding body measurements log:", error);
    }
  };
  const getClientBodyMeasurementsLogs = (clientId: string) => {
    fetchClientLogsIfNeeded(clientId);
    return bodyMeasurementLogs[clientId] || [];
  }
  
  const addExerciseProgressLog = async (clientId: string, logData: Omit<ExerciseProgressLog, 'id' | 'clientId'>) => {
     try {
      const logCollectionRef = collection(db, `users/${clientId}/exerciseProgressLogs`);
      const routine = getRoutineById(logData.routineId);
      const exercise = routine?.exercises.find(ex => ex.id === logData.exerciseId);
      const fullLogData = { ...logData, exerciseName: exercise?.name || "Ejercicio desconocido", clientId, createdAt: serverTimestamp() };
      const docRef = await addDoc(logCollectionRef, fullLogData);
      const newLog = { ...fullLogData, id: docRef.id, createdAt: Timestamp.now() } as ExerciseProgressLog;
      setExerciseProgressLogs(prev => ({ ...prev, [clientId]: [...(prev[clientId] || []), newLog].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())}));
    } catch (error) {
      console.error("Error adding exercise progress log:", error);
    }
  };
  const getClientExerciseProgressLogs = (clientId: string, routineId?: string) => {
    fetchClientLogsIfNeeded(clientId);
    const logs = exerciseProgressLogs[clientId] || [];
    return routineId ? logs.filter(log => log.routineId === routineId) : logs;
  };

  return (
    <DataContext.Provider value={{ 
      routines, clientProfiles, coaches, bodyWeightLogs, bodyMeasurementLogs, exerciseProgressLogs,
      isLoading: isLoading || authLoading || isFetchingRoutines || isFetchingClients || isFetchingCoaches || isFetchingLogs,
      isFetchingRoutines, isFetchingClients,
      addRoutine, updateRoutine, deleteRoutine, getRoutineById, getCoachRoutines, getAllRoutines,
      addClient, getClientById, getCoachClients, getAllClients, assignRoutineToClient, unassignRoutineFromClient, getClientAssignedRoutines,
      addCoach, getAllCoaches,
      addBodyWeightLog, getClientBodyWeightLogs,
      addBodyMeasurementsLog, getClientBodyMeasurementsLogs,
      addExerciseProgressLog, getClientExerciseProgressLogs
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};