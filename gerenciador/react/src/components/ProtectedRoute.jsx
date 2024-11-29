import React from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(null); 

  React.useEffect(() => {
    const token = localStorage.getItem('token'); // Recupera o token armazenado

    if (token) {
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
          setIsAuthenticated(false);
        });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    // Mostre um loader enquanto verifica
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;