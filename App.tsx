
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { UserRole } from './types';

import LoginPage from './pages/LoginPage';
import CoachDashboardPage from './pages/CoachDashboardPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import CreateRoutinePage from './pages/coach/CreateRoutinePage';
import RoutineLibraryPage from './pages/coach/RoutineLibraryPage';
import ManageClientsPage from './pages/coach/ManageClientsPage';
import ClientProgressViewPage from './pages/coach/ClientProgressViewPage';
import MyRoutinesPage from './pages/client/MyRoutinesPage';
import LogProgressPage from './pages/client/LogProgressPage';
import MyProgressPage from './pages/client/MyProgressPage';
import Navbar from './components/Navbar';

// Super Coach Pages
import SuperCoachDashboardPage from './pages/supercoach/SuperCoachDashboardPage';
import ManageCoachesPage from './pages/supercoach/ManageCoachesPage';


const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  const renderRoutes = () => {
    if (!user) {
      return (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      );
    }

    switch (user.role) {
      case UserRole.SUPER_COACH:
        return (
          <>
            <Route path="/" element={<SuperCoachDashboardPage />} />
            <Route path="/supercoach/manage-coaches" element={<ManageCoachesPage />} />
            {/* Super Coach might also access some coach routes, e.g., to view all routines or specific client details */}
            <Route path="/coach/routines" element={<RoutineLibraryPage />} /> {/* Example: SC can see all routines */}
            <Route path="/coach/clients" element={<ManageClientsPage />} /> {/* Example: SC can see all clients if logic adapted or they act as a coach */}
            <Route path="/coach/client-progress/:clientId" element={<ClientProgressViewPage />} />
            <Route path="/coach/create-routine" element={<CreateRoutinePage />} />
            <Route path="/coach/edit-routine/:routineId" element={<CreateRoutinePage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        );
      case UserRole.COACH:
        return (
          <>
            <Route path="/" element={<CoachDashboardPage />} />
            <Route path="/coach/create-routine" element={<CreateRoutinePage />} />
            <Route path="/coach/edit-routine/:routineId" element={<CreateRoutinePage />} />
            <Route path="/coach/routines" element={<RoutineLibraryPage />} />
            <Route path="/coach/clients" element={<ManageClientsPage />} />
            <Route path="/coach/client-progress/:clientId" element={<ClientProgressViewPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        );
      case UserRole.CLIENT:
        return (
          <>
            <Route path="/" element={<ClientDashboardPage />} />
            <Route path="/client/my-routines" element={<MyRoutinesPage />} />
            <Route path="/client/log-progress" element={<LogProgressPage />} />
            <Route path="/client/my-progress" element={<MyProgressPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        );
      default:
        return <Route path="*" element={<Navigate to="/login" />} />;
    }
  };


  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        {user && <Navbar />}
        <main className="flex-grow">
          <Routes>
            {renderRoutes()}
          </Routes>
        </main>
        <footer className="bg-dark text-light text-center p-4 mt-auto">
          © {new Date().getFullYear()} FitTrack Rutinas Personalizadas. Todos los derechos reservados.
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;