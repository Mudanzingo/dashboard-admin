import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';

export default function CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Tras el redirect de Hosted UI, Amplify procesa el hash automáticamente al consultar el usuario/sesión
    (async () => {
      try {
        await Auth.currentAuthenticatedUser();
        navigate('/dashboard', { replace: true });
      } catch (e) {
        navigate('/login', { replace: true });
      }
    })();
  }, [navigate]);

  return <div className="p-6 text-sm">Procesando autenticación...</div>;
}
