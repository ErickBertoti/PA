import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    // Verificação: nenhum campo pode estar vazio
    if (!email || !password) {
      setError('Todos os campos devem ser preenchidos.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/login', {
        email,
        password,
      });

      console.log(response.data);
      const { token } = response.data;

      // Armazenar o token no localStorage
      localStorage.setItem('token', token);

      // Exibe mensagem de sucesso
      setSuccess('Login realizado com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/'); // Redireciona para a página inicial
      }, 2000);
    } catch (error) {
      setError(
        error.response ? error.response.data.error : 'Erro ao realizar o login. Tente novamente.'
      );
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-gray-900">Login</h2>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              E-mail:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Senha:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Entrar
            </button>
            <Link to="/register" className="text-sm text-gray-600 hover:text-gray-900">
              Não tem uma conta? Cadastre-se
            </Link>
          </div>
        </form>
        {error && (
          <div className="mt-4 text-red-500 text-sm border border-red-400 bg-red-100 p-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 text-green-500 text-sm border border-green-400 bg-green-100 p-3 rounded">
            {success}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
