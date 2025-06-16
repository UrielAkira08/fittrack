
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import RoutineCard from '../../components/RoutineCard';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

const RoutineLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, getCoachRoutines, deleteRoutine } = useData();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);

  if (isLoading || !user) {
    return <div className="container mx-auto p-6 text-center"><LoadingSpinner /></div>;
  }

  const routines = getCoachRoutines(user.id);

  const handleDeleteClick = (routineId: string) => {
    setRoutineToDelete(routineId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (routineToDelete) {
      deleteRoutine(routineToDelete);
    }
    setShowDeleteModal(false);
    setRoutineToDelete(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Biblioteca de Rutinas</h1>
        <Link to="/coach/create-routine">
          <Button variant="primary" leftIcon={
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }>Crear Nueva Rutina</Button>
        </Link>
      </div>

      {routines.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
          </svg>
          <p className="text-xl text-gray-600 mb-2">No se encontraron rutinas.</p>
          <p className="text-gray-500">¡Empieza creando tu primera rutina de entrenamiento!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routines.map(routine => (
            <RoutineCard 
                key={routine.id} 
                routine={routine} 
                onDelete={() => handleDeleteClick(routine.id)}
            />
          ))}
        </div>
      )}
       <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Eliminación"
      >
        <p>¿Estás seguro de que quieres eliminar esta rutina? Esta acción no se puede deshacer y se desasignará de cualquier cliente.</p>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmDelete}>Eliminar Rutina</Button>
        </div>
      </Modal>
    </div>
  );
};

export default RoutineLibraryPage;