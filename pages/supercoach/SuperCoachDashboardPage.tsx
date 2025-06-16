
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

const SuperCoachDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, getAllCoaches, getAllClients, getAllRoutines } = useData();

  if (isLoading || !user) {
    return <div className="container mx-auto p-6 text-center"><LoadingSpinner /></div>;
  }

  const totalCoaches = getAllCoaches().length;
  const totalClients = getAllClients().length;
  const totalRoutines = getAllRoutines().length;


  const StatCard: React.FC<{ title: string; value: number | string; linkTo?: string; icon: React.ReactNode; actionButton?: React.ReactNode }> = 
  ({ title, value, linkTo, icon, actionButton }) => {
    const content = (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between h-full transform hover:scale-105">
            <div className="flex items-start space-x-4">
                 <div className="p-3 bg-accent text-white rounded-lg">
                    {icon}
                </div>
                <div>
                    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                    <p className="text-3xl font-bold text-dark">{value}</p>
                </div>
            </div>
            {actionButton && <div className="mt-auto pt-3">{actionButton}</div>}
        </div>
    );
    return linkTo ? <Link to={linkTo} className="block h-full">{content}</Link> : content;
};


  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8 p-6 bg-gradient-to-r from-accent to-pink-700 text-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-2">Panel de Super Entrenador</h1>
        <p className="text-pink-100">¡Bienvenido, {user.name}! Gestiona la plataforma FitTrack.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
            title="Entrenadores Totales" 
            value={totalCoaches} 
            linkTo="/supercoach/manage-coaches" 
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-3.741-5.197m-11.026 0a9.094 9.094 0 0 1 3.741-.479 3 3 0 0 1-3.741-5.197M3 13.5a9 9 0 1 0 18 0a9 9 0 0 0-18 0ZM12 12h.008v.008H12V12Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12h.008v.008H12V12Zm0 0H9.75m2.25 0H14.25M12 12v2.25m0-2.25V9.75M12 12h2.25m-2.25 0H9.75" />
                </svg>
            }
            actionButton={
                 <Link to="/supercoach/manage-coaches">
                    <Button variant="ghost" size="sm" className="w-full text-accent">Gestionar Entrenadores</Button>
                 </Link>
            }
        />
        <StatCard 
            title="Clientes Totales" 
            value={totalClients} 
            icon={
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21C7.331 21 6.142 20.58 5.165 19.825V19.128c0-1.113.285-2.16.786-3.07m0 0A9.266 9.266 0 0 1 15 12.163v.003c1.113 0 2.16.285 3.07.786m-9.75 0a9.266 9.266 0 0 0-3.07-.786A9.266 9.266 0 0 0 1.5 12.163v.003c0 1.113.285 2.16.786 3.07M4.5 16.128v.106A12.318 12.318 0 0 0 8.624 21c1.291 0 2.48-.42 3.475-1.175V16.128c0-1.113-.285-2.16-.786-3.07M12 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            } 
            // Optional: Link to a global client view if implemented
            // linkTo="/supercoach/all-clients" 
        />
        <StatCard 
            title="Rutinas Globales" 
            value={totalRoutines} 
            linkTo="/coach/routines" // Super coach uses the same routine library but sees all
            icon={
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                </svg>
            }
             actionButton={
                 <Link to="/coach/create-routine">
                    <Button variant="ghost" size="sm" className="w-full text-accent">Crear Rutina Global</Button>
                 </Link>
            }
        />
      </div>

       <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Acciones de Administración</h2>
            <div className="flex flex-wrap gap-4">
                <Link to="/supercoach/manage-coaches">
                    <Button variant="secondary" leftIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-3.741-5.197m-11.026 0a9.094 9.094 0 0 1 3.741-.479 3 3 0 0 1-3.741-5.197M3 13.5a9 9 0 1 0 18 0a9 9 0 0 0-18 0Z" /></svg>
                    }>
                        Gestionar Entrenadores
                    </Button>
                </Link>
                <Link to="/coach/routines">
                    <Button variant="outline" leftIcon={
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg>
                    }>
                        Ver Biblioteca de Rutinas
                    </Button>
                </Link>
                 {/* Potentially add more actions like "View All Clients" if such page is created */}
            </div>
        </div>
    </div>
  );
};

export default SuperCoachDashboardPage;