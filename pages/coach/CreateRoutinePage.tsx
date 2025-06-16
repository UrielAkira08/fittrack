import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Routine, Exercise, RoutineType, UserRole } from '../../types'; // Added UserRole import
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import Button from '../../components/Button';
import ExerciseCard from '../../components/ExerciseCard';
import Modal from '../../components/Modal';
import { COMMON_EXERCISES } from '../../constants';
import LoadingSpinner from '../../components/LoadingSpinner';

const CreateRoutinePage: React.FC = () => {
  const { routineId } = useParams<{ routineId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth(); // User from AuthContext (contains UID as id)
  const { addRoutine, getRoutineById, updateRoutine, isLoading: dataContextLoading, routines } = useData();

  const [routineName, setRoutineName] = useState('');
  const [routineType, setRoutineType] = useState<RoutineType>(RoutineType.TRADITIONAL_WEIGHTLIFTING);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Partial<Exercise>>({ id: '', name: '', sets: '', reps: '', rest: '', notes: '' });
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);


  useEffect(() => {
    setPageLoading(true);
    if (routineId) {
      // getRoutineById now gets from the local state in DataContext, which should be populated
      const existingRoutine = getRoutineById(routineId);
      if (existingRoutine) {
        if (user && (user.role === UserRole.SUPER_COACH || existingRoutine.createdBy === user.id)) {
            setRoutineName(existingRoutine.name);
            setRoutineType(existingRoutine.type);
            setExercises(existingRoutine.exercises);
        } else {
            // User is not authorized to edit this routine
            navigate('/coach/routines'); 
        }
      } else if (!dataContextLoading) { // If routine not found and DataContext is not loading anymore
        navigate('/coach/routines');
      }
    }
    setPageLoading(false);
  }, [routineId, getRoutineById, navigate, dataContextLoading, user, routines]); // routines added as a dependency because getRoutineById depends on it.

  const handleAddOrUpdateExercise = () => {
    if (!currentExercise.name) return; 

    const exerciseWithId: Exercise = {
      id: editingExerciseId || currentExercise.id || uuidv4(),
      name: currentExercise.name || '',
      sets: currentExercise.sets,
      reps: currentExercise.reps,
      rest: currentExercise.rest,
      notes: currentExercise.notes,
    };

    if (editingExerciseId) {
      setExercises(exercises.map(ex => ex.id === editingExerciseId ? exerciseWithId : ex));
    } else {
      setExercises([...exercises, exerciseWithId]);
    }
    closeExerciseModal();
  };

  const openExerciseModal = (exercise?: Exercise) => {
    if (exercise) {
      setCurrentExercise(exercise);
      setEditingExerciseId(exercise.id);
    } else {
      setCurrentExercise({ id: uuidv4(), name: '', sets: '', reps: '', rest: '', notes: '' });
      setEditingExerciseId(null);
    }
    setSearchTerm(''); 
    setIsExerciseModalOpen(true);
  };

  const closeExerciseModal = () => {
    setIsExerciseModalOpen(false);
    setCurrentExercise({ id: '', name: '', sets: '', reps: '', rest: '', notes: '' });
    setEditingExerciseId(null);
    setSearchTerm('');
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !routineName.trim() || exercises.length === 0) {
      alert("El nombre de la rutina y al menos un ejercicio son obligatorios.");
      return;
    }

    setIsSubmitting(true);
    const routineData = { name: routineName, type: routineType, exercises };
    
    try {
        if (routineId) {
          // createdBy is not updated here, it remains the original creator
          await updateRoutine(routineId, routineData);
        } else {
          await addRoutine(routineData, user.id); // user.id is Firebase UID
        }
        navigate('/coach/routines');
    } catch (error) {
        console.error("Error saving routine:", error);
        alert("Error al guardar la rutina. Inténtalo de nuevo.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const filteredCommonExercises = COMMON_EXERCISES.filter(exName => 
    exName.toLowerCase().includes(searchTerm.toLowerCase()) && 
    !exercises.find(e => e.name.toLowerCase() === exName.toLowerCase() && e.id !== editingExerciseId)
  );


  if ((dataContextLoading && !routines.length) || pageLoading) { // Show loading if data context is loading initial routines or page is processing routineId
      return <div className="container mx-auto p-6 text-center"><LoadingSpinner /> <p>Cargando datos de la rutina...</p></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-primary mb-6">{routineId ? 'Editar Rutina' : 'Crear Nueva Rutina'}</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <Input
          label="Nombre de la Rutina"
          value={routineName}
          onChange={(e) => setRoutineName(e.target.value)}
          placeholder="Ej: Día 1 - Fuerza Cuerpo Completo"
          required
          disabled={isSubmitting}
        />
        <Select
          label="Tipo de Rutina"
          value={routineType}
          onChange={(e) => setRoutineType(e.target.value as RoutineType)}
          options={Object.values(RoutineType).map(type => ({ value: type, label: type }))}
          required
          disabled={isSubmitting}
        />

        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Ejercicios</h2>
          {exercises.length === 0 ? (
            <p className="text-gray-500 italic">No se han añadido ejercicios. Haz clic en "Añadir Ejercicio" para empezar.</p>
          ) : (
            <div className="space-y-4">
              {exercises.map(ex => (
                <ExerciseCard 
                    key={ex.id} 
                    exercise={ex} 
                    onEdit={() => openExerciseModal(ex)} 
                    onDelete={() => handleDeleteExercise(ex.id)}
                    isEditable={!isSubmitting}
                />
              ))}
            </div>
          )}
          <Button type="button" onClick={() => openExerciseModal()} variant="outline" className="mt-4" disabled={isSubmitting} leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }>
            Añadir Ejercicio
          </Button>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={() => navigate('/coach/routines')} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? (routineId ? 'Guardando...' : 'Creando...') : (routineId ? 'Guardar Cambios' : 'Crear Rutina')}
          </Button>
        </div>
      </form>

      <Modal isOpen={isExerciseModalOpen} onClose={closeExerciseModal} title={editingExerciseId ? 'Editar Ejercicio' : 'Añadir Nuevo Ejercicio'}>
        <div className="space-y-4">
            <Input
                label="Buscar Ejercicios Comunes / Introducir Nombre"
                placeholder="Ej: Squat, Bench Press..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentExercise(prev => ({ ...prev, name: e.target.value }));
                }}
                onFocus={() => setCurrentExercise(prev => ({ ...prev, name: searchTerm }))}
            />
            {searchTerm && filteredCommonExercises.length > 0 && (
                 <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                    {filteredCommonExercises.map(exName => (
                        <button 
                            key={exName} 
                            type="button"
                            className="block w-full text-left p-1.5 hover:bg-gray-100 rounded text-sm"
                            onClick={() => {
                                setCurrentExercise(prev => ({ ...prev, name: exName }));
                                setSearchTerm(exName); 
                            }}
                        >
                            {exName}
                        </button>
                    ))}
                </div>
            )}
             <Input
                label="Nombre del Ejercicio"
                value={currentExercise.name || ''}
                onChange={(e) => setCurrentExercise(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Barbell Squat"
                required
            />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Series"
              value={currentExercise.sets || ''}
              onChange={(e) => setCurrentExercise(prev => ({ ...prev, sets: e.target.value }))}
              placeholder="Ej: 3 o 3-4"
            />
            <Input
              label="Repeticiones / Duración"
              value={currentExercise.reps || ''}
              onChange={(e) => setCurrentExercise(prev => ({ ...prev, reps: e.target.value }))}
              placeholder="Ej: 8-12, AMRAP, o 30s"
            />
          </div>
          <Input
            label="Tiempo de Descanso"
            value={currentExercise.rest || ''}
            onChange={(e) => setCurrentExercise(prev => ({ ...prev, rest: e.target.value }))}
            placeholder="Ej: 60s o 1-2min"
          />
          <Textarea
            label="Notas (Opcional)"
            value={currentExercise.notes || ''}
            onChange={(e) => setCurrentExercise(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Ej: Enfocarse en la forma, movimiento explosivo"
          />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button type="button" variant="ghost" onClick={closeExerciseModal}>Cancelar</Button>
          <Button type="button" onClick={handleAddOrUpdateExercise} variant="primary">
            {editingExerciseId ? 'Actualizar Ejercicio' : 'Añadir Ejercicio'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CreateRoutinePage;