import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, Plus, FileText, BookOpen, Tag, Link as LinkIcon, X, File, List } from 'lucide-react';

const Training = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [trainingLinks, setTrainingLinks] = useState(['']);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Fetch das categorias
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', text: 'Você precisa estar autenticado para acessar esta página.' });
      return;
    }

    axios.get('/api/categories', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        setMessage({ 
          type: 'error', 
          text: 'Não foi possível carregar as categorias' 
        });
      });
  }, []);

  const handleAddLink = () => {
    setTrainingLinks([...trainingLinks, '']);
  };

  const handleRemoveLink = (indexToRemove) => {
    setTrainingLinks(trainingLinks.filter((_, index) => index !== indexToRemove));
  };

  const handleLinkChange = (index, value) => {
    const updatedLinks = [...trainingLinks];
    updatedLinks[index] = value;
    setTrainingLinks(updatedLinks);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    
    // Validar tamanho do arquivo (50MB de limite)
    if (selectedFile && selectedFile.size > 50 * 1024 * 1024) {
      setMessage({ 
        type: 'error', 
        text: 'O arquivo deve ser menor que 50MB' 
      });
      event.target.value = null;
      return;
    }
    
    setFile(selectedFile);
    setMessage({ type: '', text: '' });
  };

  const clearFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', text: 'Você precisa estar autenticado para realizar esta ação.' });
      return;
    }

    if (!title || !description || !categoryId) {
      setMessage({ type: 'error', text: 'Título, descrição e categoria são obrigatórios.' });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categoryId', categoryId);
    
    // Acrescenta os links
    trainingLinks.forEach((link, index) => {
      if (link.trim()) {
        formData.append(`links[${index}]`, link);
      }
    });

    // Acrescenta o arquivo se houver um
    if (file) {
      formData.append('file', file);
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/trainings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage({ type: 'success', text: 'Treinamento registrado com sucesso!' });
      
      // Reseta formulário
      setTitle('');
      setDescription('');
      setCategoryId('');
      setTrainingLinks(['']);
      setFile(null);
    } catch (error) {
      console.error('Erro ao registrar treinamento:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Erro ao registrar treinamento.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewTrainings = () => {
    navigate('/trainingList');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <BookOpen className="w-8 h-8 mr-3 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">Registrar Treinamento</h2>
        </div>
        <button
          type="button"
          onClick={handleViewTrainings}
          className="flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
        >
          <List className="w-5 h-5 mr-2" />
          Ver Treinamentos
        </button>
      </div>

      {message.text && (
        <div
          className={`p-3 mb-4 text-sm rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center font-semibold mb-2 text-gray-700">
            <FileText className="w-4 h-4 mr-2 text-blue-500" />
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Digite o título do treinamento"
            required
          />
        </div>

        <div>
          <label className="flex items-center font-semibold mb-2 text-gray-700">
            <FileText className="w-4 h-4 mr-2 text-blue-500" />
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[120px]"
            placeholder="Descrição detalhada do treinamento"
            required
          ></textarea>
        </div>

        <div>
          <label className="flex items-center font-semibold mb-2 text-gray-700">
            <Tag className="w-4 h-4 mr-2 text-blue-500" />
            Categoria
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center font-semibold mb-2 text-gray-700">
            <LinkIcon className="w-4 h-4 mr-2 text-blue-500" />
            Links de Material
          </label>
          {trainingLinks.map((link, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="url"
                value={link}
                onChange={(e) => handleLinkChange(index, e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="https://"
              />
              {trainingLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveLink(index)}
                  className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddLink}
            className="flex items-center text-blue-500 hover:text-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" /> Adicionar outro link
          </button>
        </div>

        <div>
          <label className="flex items-center font-semibold mb-2 text-gray-700">
            <Upload className="w-4 h-4 mr-2 text-blue-500" />
            Arquivo (opcional)
          </label>
          <div>
            <input
              type="file"
              accept="file"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-500 hover:file:bg-blue-100"
            />
            {file && (
              <div className="flex items-center space-x-3 mt-2">
                <File className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button 
                  type="button"
                  onClick={clearFile} 
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 rounded-md text-white font-semibold transition-colors 
              ${loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
              }
            `}
          >
            {loading ? 'Enviando...' : 'Registrar Treinamento'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Training;