
import React from 'react';
import { Link } from 'react-router-dom';
import { Routine, RoutineType } from '../types';
import Button from './Button';

interface RoutineCardProps {
  routine: Routine;
  onDelete?: (routineId: string) => void;
  onAssign?: (routineId: string) => void; // For coach to assign to client
  showAssignButton?: boolean;
  isClientView?: boolean;
}

const RoutineCard: React.FC<RoutineCardProps> = ({ routine, onDelete, onAssign, showAssignButton = false, isClientView = false }) => {
  const getBadgeColor = (type: RoutineType) => {
    switch (type) {
      case RoutineType.TRADITIONAL_WEIGHTLIFTING:
        return 'bg-blue-100 text-blue-800';
      case RoutineType.FUNCTIONAL_EXERCISE:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-gray-200 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-primary">{routine.name}</h3>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getBadgeColor(routine.type)}`}>
            {routine.type}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-1">
          {routine.exercises.length} ejercicio{routine.exercises.length !== 1 ? 's' : ''}
        </p>
        <ul className="list-disc list-inside text-sm text-gray-500 mb-4 max-h-24 overflow-y-auto">
          {routine.exercises.slice(0, 3).map(ex => (
            <li key={ex.id} className="truncate">{ex.name}</li>
          ))}
          {routine.exercises.length > 3 && <li className="text-xs italic">...y más</li>}
        </ul>
      </div>
      <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
        {!isClientView && (
             <Link to={`/coach/edit-routine/${routine.id}`}>
                <Button variant="outline" size="sm">Editar</Button>
            </Link>
        )}
        {onDelete && !isClientView && (
          <Button variant="danger" size="sm" onClick={() => onDelete(routine.id)}>Eliminar</Button>
        )}
        {showAssignButton && onAssign && (
           <Button variant="secondary" size="sm" onClick={() => onAssign(routine.id)}>Asignar</Button>
        )}
         {isClientView && (
             <Link to={`/client/my-routines?view=${routine.id}`}>
                <Button variant="primary" size="sm">Ver Detalles</Button>
            </Link>
        )}
      </div>
    </div>
  );
};

export default RoutineCard;