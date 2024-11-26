import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Plus, FileText, BookOpen, Tag, Link as LinkIcon, X } from 'lucide-react';

const Training = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [trainingLinks, setTrainingLinks] = useState(['']);
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    // Fetch categories
    axios.get('/api/categories').then((response) => {
      setCategories(response.data);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    
    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar autenticado para realizar esta ação.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categoryId', categoryId);
    trainingLinks.forEach((link, index) =>
      formData.append(`trainingLinks[${index}]`, link)
    );
    if (image) {
      formData.append('image', image);
    }

    try {
      await axios.post('/api/trainings', formData,{
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        }
      });
      alert('Treinamento registrado com sucesso!');
      setTitle('');
      setDescription('');
      setCategoryId('');
      setTrainingLinks(['']);
      setImage(null);
      setPreviewImage(null);
    } catch (error) {
      console.error('Erro ao registrar treinamento:', error);
      alert('Erro ao registrar treinamento.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex items-center mb-6">
        <BookOpen className="w-8 h-8 mr-3 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800">Registrar Treinamento</h2>
      </div>

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
            Imagem (opcional)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-500 hover:file:bg-blue-100"
            />
            {previewImage && (
              <div className="relative">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <BookOpen className="w-5 h-5" />
            <span>Registrar Treinamento</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Training;