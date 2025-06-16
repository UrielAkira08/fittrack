
import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { ClientProfile, Routine } from '../../types';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import Select from '../../components/Select';

const ManageClientsPage: React.FC = () => {
  const { user } = useAuth(); // This is the Coach's User object from AuthContext
  const { isLoading: dataContextLoading, getCoachClients, addClient, getCoachRoutines, assignRoutineToClient, unassignRoutineFromClient, getClientAssignedRoutines, clientProfiles } = useData();
  
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [isAssignRoutineModalOpen, setIsAssignRoutineModalOpen] = useState(false);
  const [selectedClientForAssignment, setSelectedClientForAssignment] = useState<ClientProfile | null>(null);
  const [routineToAssign, setRoutineToAssign] = useState<string>('');


  if (dataContextLoading || !user) {
    return <div className="container mx-auto p-6 text-center"><LoadingSpinner /></div>;
  }

  const coachClients = getCoachClients(user.id); // Fetches from DataContext's local state, which is populated from Firestore
  const availableRoutines = getCoachRoutines(user.id);

  const handleAddClient = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newClientName.trim() || !newClientEmail.trim() || !newClientPassword.trim()) {
      setFormError("Nombre, correo electrónico y contraseña son obligatorios.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newClientEmail)) {
      setFormError("Por favor, introduce una dirección de correo válida.");
      return;
    }
     if (newClientPassword.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    
    setIsSubmitting(true);
    const result = await addClient({ name: newClientName, email: newClientEmail, initialPassword_plain: newClientPassword }, user.id);
    setIsSubmitting(false);

    if (result) { // addClient returns ClientProfile on success, null on failure
        setNewClientName('');
        setNewClientEmail('');
        setNewClientPassword('');
        setIsAddClientModalOpen(false);
        // Optionally show a success message
    } else {
        // Error message is often an alert from DataContext for now.
        // For a better UX, addClient could return a status/message object.
        setFormError("No se pudo añadir el cliente. El correo electrónico ya podría estar en uso.");
    }
  };

  const openAssignModal = (client: ClientProfile) => {
    setSelectedClientForAssignment(client);
    setIsAssignRoutineModalOpen(true);
    setRoutineToAssign(''); 
  };
  
  const handleAssignRoutine = async () => {
    if (selectedClientForAssignment && routineToAssign) {
      await assignRoutineToClient(selectedClientForAssignment.id, routineToAssign);
      setIsAssignRoutineModalOpen(false);
      setSelectedClientForAssignment(null);
    }
  };

  const ClientCard: React.FC<{ client: ClientProfile }> = ({ client }) => {
    // getClientAssignedRoutines will use the main routines state from DataContext
    const assignedRoutinesForCard = getClientAssignedRoutines(client.id); 
    return (
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-semibold text-primary">{client.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{client.email}</p> {/* Display email for clarity */}
            </div>
            <Link to={`/coach/client-progress/${client.id}`}>
                <Button variant="outline" size="sm">Ver Progreso</Button>
            </Link>
        </div>
        <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-600 mb-1">Rutinas Asignadas ({assignedRoutinesForCard.length}):</h4>
            {assignedRoutinesForCard.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-gray-500 space-y-1 max-h-20 overflow-y-auto">
                    {assignedRoutinesForCard.map((routine: Routine) => (
                        <li key={routine.id} className="flex justify-between items-center">
                            <span>{routine.name}</span>
                            <button 
                                onClick={() => unassignRoutineFromClient(client.id, routine.id)}
                                className="text-xs text-red-500 hover:text-red-700"
                                title="Desasignar rutina"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-xs text-gray-400 italic">No hay rutinas asignadas.</p>}
        </div>
        <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => openAssignModal(client)} 
            className="mt-4 w-full"
            disabled={availableRoutines.length === 0}
        >
            {availableRoutines.length === 0 ? "No Hay Rutinas para Asignar" : "Asignar Rutina"}
        </Button>
      </div>
    );
  };


  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Gestionar Clientes</h1>
        <Button variant="primary" onClick={() => { setFormError(''); setIsAddClientModalOpen(true);}} disabled={isSubmitting} leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
            </svg>
        }>Añadir Nuevo Cliente</Button>
      </div>

      {coachClients.length === 0 && !dataContextLoading ? (
         <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
               <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-3.741-5.197M12 15c-.293 0-.586-.023-.872-.069m-1.404-4.322a5.25 5.25 0 1 0-7.424 7.424m.058-10.844a5.25 5.25 0 0 1 7.424 0M12 15c.293 0 .586.023.872.069m1.404 4.322a5.25 5.25 0 1 0 7.424-7.424m-.058 10.844a5.25 5.25 0 0 1-7.424 0M3.75 12H.75m11.25 0h3M3.75 7.5h7.5M3.75 16.5h7.5m9-13.5L13.5 9" />
            </svg>
            <p className="text-xl text-gray-600 mb-2">Aún no hay clientes.</p>
            <p className="text-gray-500">Añade a tus clientes para empezar a asignar rutinas y seguir su progreso.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coachClients.map(client => <ClientCard key={client.id} client={client} />)}
        </div>
      )}

      <Modal isOpen={isAddClientModalOpen} onClose={() => setIsAddClientModalOpen(false)} title="Añadir Nuevo Cliente">
        <form onSubmit={handleAddClient} className="space-y-4">
          {formError && <p className="text-xs text-red-500 bg-red-50 p-2 rounded">{formError}</p>}
          <Input
            label="Nombre del Cliente"
            value={newClientName}
            onChange={(e) => { setNewClientName(e.target.value); setFormError(''); }}
            placeholder="Ej: Ana López"
            required
            disabled={isSubmitting}
          />
          <Input
            label="Correo Electrónico del Cliente"
            type="email"
            value={newClientEmail}
            onChange={(e) => {
                setNewClientEmail(e.target.value);
                setFormError('');
            }}
            placeholder="Ej: ana.lopez@ejemplo.com"
            required
            disabled={isSubmitting}
          />
          <Input
            label="Contraseña Inicial del Cliente"
            type="password"
            value={newClientPassword}
            onChange={(e) => { setNewClientPassword(e.target.value); setFormError(''); }}
            placeholder="Mínimo 6 caracteres"
            required
            disabled={isSubmitting}
          />
           <p className="text-xs text-gray-500">El cliente podrá (y debería) cambiar esta contraseña más adelante.</p>
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddClientModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? "Añadiendo..." : "Añadir Cliente"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAssignRoutineModalOpen && selectedClientForAssignment !== null} onClose={() => setIsAssignRoutineModalOpen(false)} title={`Asignar Rutina a ${selectedClientForAssignment?.name}`}>
        <div className="space-y-4">
            {availableRoutines.length > 0 ? (
                <Select
                    label="Seleccionar Rutina"
                    value={routineToAssign}
                    onChange={(e) => setRoutineToAssign(e.target.value)}
                    options={availableRoutines.map(r => ({ value: r.id, label: r.name }))}
                    placeholder="-- Elige una rutina --"
                    required
                />
            ) : (
                <p className="text-gray-600">Aún no has creado rutinas. <Link to="/coach/create-routine" className="text-primary hover:underline">Crea una primero</Link>.</p>
            )}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button type="button" variant="ghost" onClick={() => setIsAssignRoutineModalOpen(false)}>Cancelar</Button>
          <Button type="button" onClick={handleAssignRoutine} variant="primary" disabled={!routineToAssign || availableRoutines.length === 0}>
            Asignar Rutina
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageClientsPage;
