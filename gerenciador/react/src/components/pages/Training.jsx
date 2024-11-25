import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Training = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [trainingLinks, setTrainingLinks] = useState(['']);
  const [image, setImage] = useState(null);

  

  useEffect(() => {
    // Fetch categories
    axios.get('/api/categories').then((response) => {
      setCategories(response.data);
    });
  }, []);

  const handleAddLink = () => {
    setTrainingLinks([...trainingLinks, '']);
  };

  const handleLinkChange = (index, value) => {
    const updatedLinks = [...trainingLinks];
    updatedLinks[index] = value;
    setTrainingLinks(updatedLinks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', text: 'Você precisa estar autenticado para realizar esta ação.' });
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
    } catch (error) {
      console.error('Erro ao registrar treinamento:', error);
      alert('Erro ao registrar treinamento.');
    }
  };

  return (
    <form className="p-6 bg-white shadow-md rounded" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Registrar Treinamento</h2>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          required
        ></textarea>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Categoria</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full p-2 border rounded"
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

      <div className="mb-4">
        <label className="block font-semibold mb-2">Links de Material</label>
        {trainingLinks.map((link, index) => (
          <input
            key={index}
            type="url"
            value={link}
            onChange={(e) => handleLinkChange(index, e.target.value)}
            className="w-full p-2 mb-2 border rounded"
            placeholder="https://"
          />
        ))}
        <button
          type="button"
          onClick={handleAddLink}
          className="text-blue-500 hover:underline"
        >
          + Adicionar outro link
        </button>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Imagem (opcional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Registrar
      </button>
    </form>
  );
};

export default Training;
