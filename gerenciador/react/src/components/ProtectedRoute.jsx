import React from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(null); // null enquanto verifica

  React.useEffect(() => {
    const token = localStorage.getItem('token'); // Recupera o token armazenado (assumindo que você o guardou no localStorage)

    if (token) {
      // Envia o token no cabeçalho Authorization
      axios
        .get('/api/authenticated', {
          headers: {
            Authorization: `Bearer ${token}`, // Token no formato Bearer <token>
          },
        })
        .then(response => {
          setIsAuthenticated(response.data.isAuthenticated);
        })
        .catch(() => {
          setIsAuthenticated(false); // Caso ocorra erro (como 401)
        });
    } else {
      setIsAuthenticated(false); // Se não houver token, não está autenticado
    }
  }, []);

  if (isAuthenticated === null) {
    // Mostre um loader ou nada enquanto verifica
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;