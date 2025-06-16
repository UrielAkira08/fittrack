
import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User, UserRole } from '../../types';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageCoachesPage: React.FC = () => {
  const { user: superCoachUser } = useAuth(); // Super Coach user
  const { isLoading: dataContextLoading, getAllCoaches, addCoach } = useData();
  
  const [isAddCoachModalOpen, setIsAddCoachModalOpen] = useState(false);
  const [newCoachName, setNewCoachName] = useState('');
  const [newCoachEmail, setNewCoachEmail] = useState('');
  const [newCoachPassword, setNewCoachPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (dataContextLoading || !superCoachUser || superCoachUser.role !== UserRole.SUPER_COACH) {
    return <div className="container mx-auto p-6 text-center"><LoadingSpinner /></div>;
  }

  const coaches = getAllCoaches(); // Fetches from DataContext's local state, populated from Firestore

  const handleAddCoach = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newCoachName.trim() || !newCoachEmail.trim() || !newCoachPassword.trim()) {
      setFormError("Nombre, correo electrónico y contraseña son obligatorios.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newCoachEmail)) {
      setFormError("Por favor, introduce una dirección de correo válida.");
      return;
    }
    if (newCoachPassword.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    
    setIsSubmitting(true);
    // user.id is SuperCoach's UID, passed for potential logging or validation if needed
    const result = await addCoach({ name: newCoachName, email: newCoachEmail, initialPassword_plain: newCoachPassword }, superCoachUser.id);
    setIsSubmitting(false);

    if (result) { // addCoach returns User object on success, null on failure
        setNewCoachName('');
        setNewCoachEmail('');
        setNewCoachPassword('');
        setIsAddCoachModalOpen(false);
        // Optionally show success message
    } else {
        // Error message is often an alert from DataContext for now.
        setFormError("No se pudo añadir el entrenador. El correo electrónico ya podría estar en uso.");
    }
  };

  const CoachInfoCard: React.FC<{ coach: User }> = ({ coach }) => (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h3 className="text-lg font-semibold text-primary">{coach.name}</h3>
      <p className="text-sm text-gray-600">{coach.email}</p> {/* Display email */}
      {/* Add more details or actions if needed, e.g., edit coach, view their clients */}
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-accent">Gestionar Entrenadores</h1>
        <Button variant="primary" onClick={() => { setFormError(''); setIsAddCoachModalOpen(true); }} disabled={isSubmitting} leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
            </svg>
        }>Añadir Nuevo Entrenador</Button>
      </div>

      {coaches.length === 0 && !dataContextLoading ? (
         <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-3.741-5.197m-11.026 0a9.094 9.094 0 0 1 3.741-.479 3 3 0 0 1-3.741-5.197M3 13.5a9 9 0 1 0 18 0a9 9 0 0 0-18 0ZM12 12h.008v.008H12V12Z" />
            </svg>
            <p className="text-xl text-gray-600 mb-2">Aún no hay entrenadores registrados.</p>
            <p className="text-gray-500">Añade entrenadores para que puedan empezar a gestionar a sus clientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map(c => <CoachInfoCard key={c.id} coach={c} />)}
        </div>
      )}

      <Modal isOpen={isAddCoachModalOpen} onClose={() => setIsAddCoachModalOpen(false)} title="Añadir Nuevo Entrenador">
        <form onSubmit={handleAddCoach} className="space-y-4">
          {formError && <p className="text-xs text-red-500 bg-red-50 p-2 rounded">{formError}</p>}
          <Input
            label="Nombre del Entrenador"
            value={newCoachName}
            onChange={(e) => { setNewCoachName(e.target.value); setFormError(''); }}
            placeholder="Ej: Laura Matos"
            required
            disabled={isSubmitting}
          />
          <Input
            label="Correo Electrónico del Entrenador"
            type="email"
            value={newCoachEmail}
            onChange={(e) => { setNewCoachEmail(e.target.value); setFormError(''); }}
            placeholder="Ej: laura.matos@ejemplo.com"
            required
            disabled={isSubmitting}
          />
          <Input
            label="Contraseña Inicial del Entrenador"
            type="password"
            value={newCoachPassword}
            onChange={(e) => { setNewCoachPassword(e.target.value); setFormError(''); }}
            placeholder="Mínimo 6 caracteres"
            required
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500">El entrenador podrá (y debería) cambiar esta contraseña más adelante.</p>
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddCoachModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? "Añadiendo..." : "Añadir Entrenador"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageCoachesPage;
