import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const CoachDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, getCoachRoutines, getCoachClients } = useData();

  if (isLoading || !user) {
    return <div className="container mx-auto p-6 text-center"><LoadingSpinner /></div>;
  }

  const coachRoutines = getCoachRoutines(user.id);
  const coachClients = getCoachClients(user.id);

  const StatCard: React.FC<{ title: string; value: number | string; linkTo: string; icon: React.ReactNode }> = ({ title, value, linkTo, icon }) => (
    <Link to={linkTo} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-start space-x-4 transform hover:scale-105">
      <div className="p-3 bg-primary text-white rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-dark">{value}</p>
      </div>
    </Link>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8 p-6 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-2">¡Bienvenido, {user.name}!</h1>
        <p className="text-blue-100">Gestiona tus rutinas y clientes de forma eficaz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Rutinas Totales" value={coachRoutines.length} linkTo="/coach/routines" icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
          </svg>
        } />
        <StatCard title="Clientes Activos" value={coachClients.length} linkTo="/coach/clients" icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21C7.331 21 6.142 20.58 5.165 19.825V19.128c0-1.113.285-2.16.786-3.07m0 0A9.266 9.266 0 0 1 15 12.163v.003c1.113 0 2.16.285 3.07.786m-9.75 0a9.266 9.266 0 0 0-3.07-.786A9.266 9.266 0 0 0 1.5 12.163v.003c0 1.113.285 2.16.786 3.07M4.5 16.128v.106A12.318 12.318 0 0 0 8.624 21c1.291 0 2.48-.42 3.475-1.175V16.128c0-1.113-.285-2.16-.786-3.07M12 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        } />
         <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center space-y-3">
            <h3 className="text-gray-500 text-sm font-medium">Acciones Rápidas</h3>
            <Link to="/coach/create-routine">
                <Button variant="primary" size="md" leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                }>Nueva Rutina</Button>
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Rutinas Recientes</h2>
          {coachRoutines.length > 0 ? (
            <ul className="space-y-3">
              {coachRoutines.slice(0, 3).map(routine => (
                <li key={routine.id} className="p-3 border rounded-md hover:bg-gray-50">
                  <Link to={`/coach/edit-routine/${routine.id}`} className="font-medium text-primary hover:underline">{routine.name}</Link>
                  <p className="text-xs text-gray-500">{routine.exercises.length} ejercicios</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aún no has creado rutinas.</p>
          )}
          {coachRoutines.length > 3 && <Link to="/coach/routines" className="text-sm text-primary hover:underline mt-3 block">Ver todas las rutinas &rarr;</Link>}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Clientes Recientes</h2>
           {coachClients.length > 0 ? (
            <ul className="space-y-3">
              {coachClients.slice(0, 3).map(client => (
                <li key={client.id} className="p-3 border rounded-md hover:bg-gray-50">
                  <Link to={`/coach/client-progress/${client.id}`} className="font-medium text-primary hover:underline">{client.name} ({client.id})</Link>
                  <p className="text-xs text-gray-500">{client.assignedRoutineIds.length} rutinas asignadas</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aún no has añadido clientes.</p>
          )}
           {coachClients.length > 3 && <Link to="/coach/clients" className="text-sm text-primary hover:underline mt-3 block">Ver todos los clientes &rarr;</Link>}
        </div>
      </div>
    </div>
  );
};

export default CoachDashboardPage;