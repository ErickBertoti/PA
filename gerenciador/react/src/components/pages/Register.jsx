import React, { useState } from 'react';
import { FileText, Lock, Shield, User, Award } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Verifica se algum campo está vazio
    if (!name || !email || !password) {
      setError('Todos os campos devem ser preenchidos.');
      return;
    }
    try {
      const response = await axios.post('/api/signup', {
        name,
        email,
        password,
      });
      // Exibe mensagem de sucesso
      setSuccess('Cadastro realizado com sucesso! Você será redirecionado.');

      // Limpa os campos após sucesso
      setName('');
      setEmail('');
      setPassword('');
      setError(null);

      // Redireciona para login após 3 segundos
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (error) {
      setSuccess(null);
      setError('Erro ao realizar cadastro.');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="w-full max-w-4xl flex shadow-2xl rounded-2xl overflow-hidden">
        {/* Sidebar informativo */}
        <div className="w-1/2 bg-green-600 text-white p-8 flex flex-col justify-center space-y-6">
          <div className="flex items-center space-x-4">
            <FileText className="w-12 h-12" />
            <p className="text-xl">Centralize seus documentos</p>
          </div>
          <div className="flex items-center space-x-4">
            <Shield className="w-12 h-12" />
            <p className="text-xl">Segurança de informações</p>
          </div>
          <div className="flex items-center space-x-4">
            <Award className="w-12 h-12" />
            <p className="text-xl">Gestão de treinamentos</p>
          </div>
          <div className="mt-6 text-sm opacity-75">
            Crie sua conta e comece a gerenciar
          </div>
        </div>

        {/* Formulário de Cadastro */}
        <div className="w-1/2 bg-white p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <User className="mr-3 text-green-600" /> Cadastro
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="name" 
                className="block text-gray-700 font-semibold mb-2"
              >
                Nome Completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-300"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-300"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-300"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105"
              >
                Cadastrar
              </button>
              <a 
                href="/login" 
                className="text-sm text-green-600 hover:text-green-800 transition duration-300"
              >
                Já tem conta? Faça login
              </a>
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

export default Register;