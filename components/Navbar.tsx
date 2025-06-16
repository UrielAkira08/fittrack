
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { APP_NAME } from '../constants';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  let roleDisplay = '';
  let links: { to: string; label: string }[] = [];

  if (user) {
    switch (user.role) {
      case UserRole.SUPER_COACH:
        roleDisplay = 'Super Entrenador';
        links = [
          { to: '/', label: 'Panel Super Coach' },
          { to: '/supercoach/manage-coaches', label: 'Gestionar Entrenadores' },
          // Optional: Access to global routine library or client lists
          { to: '/coach/routines', label: 'Biblioteca Rutinas (Global)' },
        ];
        break;
      case UserRole.COACH:
        roleDisplay = 'Entrenador';
        links = [
          { to: '/', label: 'Panel Entrenador' },
          { to: '/coach/routines', label: 'Mis Rutinas' },
          { to: '/coach/clients', label: 'Mis Clientes' },
        ];
        break;
      case UserRole.CLIENT:
        roleDisplay = 'Cliente';
        links = [
          { to: '/', label: 'Mi Panel' },
          { to: '/client/my-routines', label: 'Mis Rutinas' },
          { to: '/client/log-progress', label: 'Registrar Progreso' },
          { to: '/client/my-progress', label: 'Mi Progreso' },
        ];
        break;
    }
  }


  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-gray-200">
          {APP_NAME} {roleDisplay && <span className="text-sm font-normal">({roleDisplay})</span>}
        </Link>
        <div className="flex items-center space-x-4">
          {links.map(link => (
            <Link key={link.to} to={link.to} className="px-3 py-2 rounded hover:bg-blue-700 transition duration-150 text-sm md:text-base">
              {link.label}
            </Link>
          ))}
          {user && (
            <div className="relative group">
               <span className="cursor-pointer px-3 py-2 rounded hover:bg-blue-700 transition duration-150 flex items-center">
                {user.name || user.id}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
               </span>
               <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block">
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Cerrar Sesión
                    </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;