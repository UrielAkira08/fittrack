
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Routine, Exercise } from '../../types';
import RoutineCard from '../../components/RoutineCard';
import ExerciseCard from '../../components/ExerciseCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';

const MyRoutinesPage: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, getClientAssignedRoutines } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const routineIdToView = queryParams.get('view');
    if (user && routineIdToView) {
      const routines = getClientAssignedRoutines(user.id);
      const routine = routines.find(r => r.id === routineIdToView);
      setSelectedRoutine(routine || null);
    } else {
        setSelectedRoutine(null); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, user]); 


  if (isLoading || !user) {
    return <div className="container mx-auto p-6 text-center"><LoadingSpinner /></div>;
  }

  const routines = getClientAssignedRoutines(user.id);

  if (selectedRoutine) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Button onClick={() => navigate('/client/my-routines')} variant="outline" size="sm" className="mb-6">
            &larr; Volver a Todas las Rutinas
        </Button>
        <div className="bg-white p-6 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold text-primary mb-2">{selectedRoutine.name}</h1>
            <p className="text-sm text-gray-500 mb-1">Tipo: {selectedRoutine.type}</p>
            <p className="text-sm text-gray-500 mb-6">Entrenador: {selectedRoutine.createdBy}</p>
            
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Ejercicios:</h2>
            {selectedRoutine.exercises.length > 0 ? (
                <div className="space-y-4">
                {selectedRoutine.exercises.map((exercise: Exercise) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
                </div>
            ) : (
                <p className="text-gray-500">No hay ejercicios en esta rutina.</p>
            )}
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-secondary mb-8">Mis Rutinas Asignadas</h1>
      {routines.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.875 21L17.25 12l-5.25 4.5" />
          </svg>
          <p className="text-xl text-gray-600 mb-2">Aún no tienes rutinas asignadas.</p>
          <p className="text-gray-500">Tu entrenador aún no te ha asignado ninguna rutina. Por favor, revisa más tarde o contacta a tu entrenador.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routines.map(routine => (
            <RoutineCard key={routine.id} routine={routine} isClientView={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRoutinesPage;