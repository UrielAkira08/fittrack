
import React from 'react';
import { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exerciseId: string) => void;
  isEditable?: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onEdit, onDelete, isEditable = false }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h4 className="text-lg font-semibold text-primary mb-2">{exercise.name}</h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700">
        {exercise.sets && <p><span className="font-medium">Series:</span> {exercise.sets}</p>}
        {exercise.reps && <p><span className="font-medium">Reps:</span> {exercise.reps}</p>}
        {exercise.rest && <p><span className="font-medium">Descanso:</span> {exercise.rest}</p>}
      </div>
      {exercise.notes && <p className="mt-2 text-xs text-gray-600 italic"><span className="font-medium not-italic">Notas:</span> {exercise.notes}</p>}
      {isEditable && onEdit && onDelete && (
        <div className="mt-3 flex space-x-2">
          <button
            onClick={() => onEdit(exercise)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(exercise.id)}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;