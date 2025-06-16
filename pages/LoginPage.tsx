
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { 
    APP_NAME, 
    MOCK_CLIENT_EMAIL_1,
    MOCK_COACH_EMAIL,
    MOCK_SUPER_COACH_EMAIL
} from '../constants';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('El correo electrónico es obligatorio.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Por favor, introduce una dirección de correo válida.');
        return;
    }
    if (!password) {
        setError('La contraseña es obligatoria.');
        return;
    }
    setError('');
    setIsLoading(true);
    const result = await login(email, password); // login now uses Firebase
    setIsLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Error de inicio de sesión. Verifica tus credenciales.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-blue-600 to-secondary p-4">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105 duration-300">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">{APP_NAME}</h1>
        <p className="text-center text-gray-600 mb-8">Tu camino hacia el máximo rendimiento comienza aquí.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <Input 
          label="Correo Electrónico"
          type="email"
          name="email"
          placeholder="tu@ejemplo.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError('');}}
          containerClassName="mb-4"
        />
        <Input 
          label="Contraseña"
          type="password"
          name="password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError('');}}
          containerClassName="mb-6"
        />

        <Button 
          onClick={handleLogin} 
          variant="primary" 
          size="lg" 
          className="w-full"
          isLoading={isLoading}
        >
          {isLoading ? 'Accediendo...' : 'Acceder'}
        </Button>
        
         <div className="mt-8 text-center text-sm text-gray-500">
            <p className="mb-2">Para demostración rápida:</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                <Button 
                    variant="outline" size="sm"
                    onClick={() => { setEmail(MOCK_SUPER_COACH_EMAIL); setPassword(''); setError(''); }}
                >
                    Super Coach Email
                </Button>
                <Button 
                    variant="outline" size="sm"
                    onClick={() => { setEmail(MOCK_COACH_EMAIL); setPassword(''); setError(''); }}
                >
                    Entrenador Email
                </Button>
                <Button 
                    variant="outline" size="sm"
                    onClick={() => { setEmail(MOCK_CLIENT_EMAIL_1); setPassword(''); setError(''); }}
                >
                    Cliente Email
                </Button>
            </div>
            <p className="mt-3 text-xs text-gray-400">
                (Introduce la contraseña que estableciste en Firebase para estos correos)
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
