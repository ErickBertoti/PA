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
    
    trainingLinks.forEach((link, index) => {
      if (link.trim()) {
        formData.append(`links[${index}]`, link);
      }
    });

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
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Registrar Treinamento</h2>
          </div>
          <button
            type="button"
            onClick={handleViewTrainings}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-gray-100 h-10 px-4 py-2"
          >
            <List className="w-4 h-4 mr-2" />
            Ver Treinamentos
          </button>
        </div>

        <div className="p-6">
          {message.text && (
            <div
              className={`
                p-4 mb-4 rounded-lg text-sm 
                ${message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'}
              `}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Digite o título do treinamento"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Descrição detalhada do treinamento"
                required
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-blue-600" />
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <LinkIcon className="w-4 h-4 mr-2 text-blue-600" />
                Links de Material
              </label>
              {trainingLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="https://"
                  />
                  {trainingLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-destructive/10 hover:bg-destructive/20 h-10 w-10 p-0"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddLink}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 text-blue-600 hover:bg-blue-50 h-10 px-4"
              >
                <Plus className="w-4 h-4 mr-2" /> Adicionar outro link
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Upload className="w-4 h-4 mr-2 text-blue-600" />
                Arquivo (opcional)
              </label>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <input
                  type="file"
                  accept="*"
                  onChange={handleFileChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-blue-600 hover:file:text-blue-700"
                />
                {file && (
                  <div className="flex items-center space-x-3 mt-2 p-3 bg-blue-50 rounded-md">
                    <File className="h-6 w-6 text-blue-600" />
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-gray-700">{file.name}</p>
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
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}
                `}
              >
                {loading ? 'Enviando...' : 'Registrar Treinamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Training;
