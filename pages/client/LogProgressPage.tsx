
import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { BodyWeightLog, BodyMeasurementsLog, ExerciseProgressLog, MeasurementType, Routine, Exercise } from '../../types';
import { AVAILABLE_MEASUREMENT_TYPES } from '../../constants';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Textarea from '../../components/Textarea';
import LoadingSpinner from '../../components/LoadingSpinner';

const LogProgressPage: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, addBodyWeightLog, addBodyMeasurementsLog, addExerciseProgressLog, getClientAssignedRoutines } = useData();

  const today = new Date().toISOString().split('T')[0];
  const [logDate, setLogDate] = useState(today);
  
  // Body Weight
  const [weightKg, setWeightKg] = useState<string>('');

  // Body Measurements
  const [measurements, setMeasurements] = useState<Partial<Record<MeasurementType, string>>>({});

  // Exercise Progress
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [exerciseWeightLbs, setExerciseWeightLbs] = useState<string>('');
  const [exerciseReps, setExerciseReps] = useState<string>('');
  const [exerciseDuration, setExerciseDuration] = useState<string>('');
  const [exerciseNotes, setExerciseNotes] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'exercise' | 'weight' | 'measurements'>('exercise');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading || !user) {
    return <div className="container mx-auto p-6 text-center"><LoadingSpinner /></div>;
  }

  const assignedRoutines = getClientAssignedRoutines(user.id);
  const selectedRoutine = assignedRoutines.find(r => r.id === selectedRoutineId);
  const routineExercises = selectedRoutine ? selectedRoutine.exercises : [];

  const handleShowSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleLogWeight = async (e: FormEvent) => {
    e.preventDefault();
    if (parseFloat(weightKg) > 0) {
      setIsSubmitting(true);
      await addBodyWeightLog(user.id, { date: logDate, weightKg: parseFloat(weightKg) });
      setIsSubmitting(false);
      setWeightKg('');
      handleShowSuccess('¡Peso corporal registrado con éxito!');
    }
  };

  const handleLogMeasurements = async (e: FormEvent) => {
    e.preventDefault();
    const validMeasurements = Object.entries(measurements)
      .filter(([, value]) => parseFloat(value as string) > 0)
      .map(([type, value]) => ({ type: type as MeasurementType, valueCm: parseFloat(value as string) }));

    if (validMeasurements.length > 0) {
      setIsSubmitting(true);
      await addBodyMeasurementsLog(user.id, { date: logDate, measurements: validMeasurements });
      setIsSubmitting(false);
      setMeasurements({});
      handleShowSuccess('¡Medidas corporales registradas con éxito!');
    }
  };

  const handleLogExercise = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedRoutineId && selectedExerciseId) {
      const logEntry: Omit<ExerciseProgressLog, 'id' | 'clientId'> = { // clientId will be added by addExerciseProgressLog
        date: logDate,
        routineId: selectedRoutineId,
        exerciseId: selectedExerciseId,
      };
      if (exerciseWeightLbs) logEntry.weightLbs = parseFloat(exerciseWeightLbs);
      if (exerciseReps) logEntry.repsAchieved = exerciseReps;
      if (exerciseDuration) logEntry.duration = exerciseDuration;
      if (exerciseNotes) logEntry.notes = exerciseNotes;
      
      setIsSubmitting(true);
      await addExerciseProgressLog(user.id, logEntry);
      setIsSubmitting(false);
      
      setExerciseWeightLbs('');
      setExerciseReps('');
      setExerciseDuration('');
      setExerciseNotes('');
      // Optionally reset selectedRoutineId and selectedExerciseId if desired after logging
      // setSelectedExerciseId(''); 
      handleShowSuccess('¡Progreso de ejercicio registrado con éxito!');
    }
  };

  const TabButton: React.FC<{tabKey: 'weight' | 'measurements' | 'exercise', label: string}> = ({ tabKey, label }) => (
    <button
        type="button"
        onClick={() => setActiveTab(tabKey)}
        className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors
            ${activeTab === tabKey ? 'bg-white text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-accent mb-6">Registra Tu Progreso</h1>
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md shadow-sm transition-opacity duration-300">
          {successMessage}
        </div>
      )}

      <div className="mb-6">
        <Input
          label="Fecha del Registro"
          type="date"
          value={logDate}
          onChange={(e) => setLogDate(e.target.value)}
          containerClassName="max-w-xs"
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-2" aria-label="Tabs">
            <TabButton tabKey="exercise" label="Registrar Ejercicio" />
            <TabButton tabKey="weight" label="Registrar Peso Corporal" />
            <TabButton tabKey="measurements" label="Registrar Medidas" />
        </nav>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'weight' && (
          <form onSubmit={handleLogWeight} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Registrar Peso Corporal</h2>
            <Input
              label="Peso (kg)"
              type="number"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="Ej: 70.5"
              required
              min="0"
              disabled={isSubmitting}
            />
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Registrar Peso'}
            </Button>
          </form>
        )}

        {activeTab === 'measurements' && (
          <form onSubmit={handleLogMeasurements} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Registrar Medidas Corporales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_MEASUREMENT_TYPES.map(type => (
                <Input
                  key={type}
                  label={type} 
                  type="number"
                  step="0.1"
                  value={measurements[type] || ''}
                  onChange={(e) => setMeasurements(prev => ({ ...prev, [type]: e.target.value }))}
                  placeholder="Valor en cm"
                  min="0"
                  disabled={isSubmitting}
                />
              ))}
            </div>
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Registrar Medidas'}
            </Button>
          </form>
        )}

        {activeTab === 'exercise' && (
          <form onSubmit={handleLogExercise} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Registrar Rendimiento de Ejercicio</h2>
             {assignedRoutines.length === 0 ? (
                <p className="text-gray-500">No hay rutinas asignadas. Aún no puedes registrar el rendimiento de los ejercicios.</p>
             ) : (
                <>
                <Select
                    label="Seleccionar Rutina"
                    value={selectedRoutineId}
                    onChange={(e) => {setSelectedRoutineId(e.target.value); setSelectedExerciseId('');}}
                    options={assignedRoutines.map((r: Routine) => ({ value: r.id, label: r.name }))}
                    placeholder="-- Elige una rutina --"
                    required
                    disabled={isSubmitting}
                />
                {selectedRoutine && (
                    <Select
                    label="Seleccionar Ejercicio"
                    value={selectedExerciseId}
                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                    options={routineExercises.map((ex: Exercise) => ({ value: ex.id, label: ex.name }))}
                    placeholder="-- Elige un ejercicio --"
                    required
                    disabled={isSubmitting || !selectedRoutineId}
                    />
                )}
                {selectedExerciseId && (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                        label="Peso Levantado (lbs)"
                        type="number"
                        step="0.1"
                        value={exerciseWeightLbs}
                        onChange={(e) => setExerciseWeightLbs(e.target.value)}
                        placeholder="Ej: 135"
                        min="0"
                        disabled={isSubmitting}
                        />
                        <Input
                        label="Repeticiones Logradas"
                        value={exerciseReps}
                        onChange={(e) => setExerciseReps(e.target.value)}
                        placeholder="Ej: 10,9,8 o 12"
                        disabled={isSubmitting}
                        />
                    </div>
                    <Input
                        label="Duración (para ejercicios cronometrados)"
                        value={exerciseDuration}
                        onChange={(e) => setExerciseDuration(e.target.value)}
                        placeholder="Ej: 30s, 2min"
                        disabled={isSubmitting}
                    />
                    <Textarea
                        label="Notas (Opcional)"
                        value={exerciseNotes}
                        onChange={(e) => setExerciseNotes(e.target.value)}
                        placeholder="¿Cómo te sentiste? ¿Algún PR?"
                        disabled={isSubmitting}
                    />
                    <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting || !selectedExerciseId}>
                        {isSubmitting ? 'Registrando...' : 'Registrar Ejercicio'}
                    </Button>
                    </>
                )}
                </>
             )}
          </form>
        )}
      </div>
    </div>
  );
};

export default LogProgressPage;
