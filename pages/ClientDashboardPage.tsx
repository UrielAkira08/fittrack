
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import RoutineCard from '../components/RoutineCard';
import ProgressChart from '../components/ProgressChart';
import { BodyWeightLog } from '../types';

const ClientDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, getClientAssignedRoutines, getClientBodyWeightLogs } = useData();

  if (isLoading || !user) {
    return <div className="container mx-auto p-6 text-center"><LoadingSpinner /></div>;
  }

  const assignedRoutines = getClientAssignedRoutines(user.id);
  const weightLogs = getClientBodyWeightLogs(user.id);

  const formattedWeightData = weightLogs.map((log: BodyWeightLog) => ({
    date: log.date,
    value: log.weightKg,
  }));

  const latestRoutine = assignedRoutines.length > 0 ? assignedRoutines[0] : null; // Simplistic: show the first assigned one

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8 p-6 bg-gradient-to-r from-secondary to-green-600 text-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-2">¡Hola, {user.name}!</h1>
        <p className="text-green-100">¿Listo/a para darlo todo en tu entrenamiento de hoy?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Routine Section */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Tu Rutina Actual</h2>
          {latestRoutine ? (
            <RoutineCard routine={latestRoutine} isClientView={true} />
          ) : (
            <p className="text-gray-500">Aún no tienes una rutina asignada. ¡Contacta a tu entrenador!</p>
          )}
          <Link to="/client/my-routines" className="mt-4 inline-block text-primary hover:underline">
            Ver Todas Mis Rutinas &rarr;
          </Link>
        </div>

        {/* Quick Log & Progress Overview Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Acciones Rápidas y Progreso</h2>
            <Link to="/client/log-progress">
                <button className="bg-accent text-white px-4 py-2 rounded-md hover:bg-pink-700 transition duration-150 text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Registrar Progreso de Hoy
                </button>
            </Link>
          </div>
          
          {weightLogs.length > 0 ? (
            <ProgressChart 
              data={formattedWeightData}
              title="Tendencia de Peso Corporal (kg)"
              dataKey="value"
              yAxisLabel="Peso (kg)"
            />
          ) : (
            <p className="text-gray-500 mb-4">Aún no has registrado tu peso. ¡Empieza a registrar para ver tu progreso!</p>
          )}
          <Link to="/client/my-progress" className="mt-4 inline-block text-primary hover:underline">
            Ver Progreso Detallado &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardPage;