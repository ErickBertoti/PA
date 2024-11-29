import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FileText, Lock, Shield, User, Award } from 'lucide-react';

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

    if (!email || !password) {
      setError('Todos os campos devem ser preenchidos.');
      return;
    }

    //Executa o Login e cria o token
    try {
      const response = await axios.post('http://localhost:8080/api/login', {
        email,
        password,
      });

      console.log(response.data);
      const { token } = response.data;

      localStorage.setItem('token', token);

      setSuccess('Login realizado com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setError(
        error.response ? error.response.data.error : 'Erro ao realizar o login. Tente novamente.'
      );
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-4xl flex shadow-2xl rounded-2xl overflow-hidden">
        {/* Sidebar informativo */}
        <div className="w-1/2 bg-blue-600 text-white p-8 flex flex-col justify-center space-y-6">
          <div className="flex items-center space-x-4">
            <FileText className="w-12 h-12" />
            <p className="text-xl">Gerencie documentos com precisão</p>
          </div>
          <div className="flex items-center space-x-4">
            <Shield className="w-12 h-12" />
            <p className="text-xl">Controle de licenças simplificado</p>
          </div>
          <div className="flex items-center space-x-4">
            <Award className="w-12 h-12" />
            <p className="text-xl">Acompanhamento de treinamentos</p>
          </div>
          <div className="mt-6 text-sm opacity-75">
            Seu sistema centralizado de gestão corporativa
          </div>
        </div>

        {/* Formulário de Login */}
        <div className="w-1/2 bg-white p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <User className="mr-3 text-blue-600" /> Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="email" 
                className="block text-gray-700 font-semibold mb-2"
              >
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div>
              <label 
                htmlFor="password" 
                className="block text-gray-700 font-semibold mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105"
              >
                Entrar
              </button>
              <Link 
                to="/register" 
                className="text-sm text-blue-600 hover:text-blue-800 transition duration-300"
              >
                Não tem conta? Cadastre-se agora
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
    </div>
  );
};

export default Login;