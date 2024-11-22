import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Training() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState(['']);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Erro ao carregar as categorias:', error);
      }
    };

    fetchCategories();
  }, []);

  const submit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', text: 'Você precisa estar autenticado para realizar esta ação.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categoryId', categoryId);
    formData.append('links', JSON.stringify(links));

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/trainings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage({ type: 'success', text: 'Treinamento enviado com sucesso!' });
      setFile(null);
      setTitle('');
      setDescription('');
      setCategoryId('');
      setLinks(['']);
      console.log('Treinamento criado:', response.data);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao enviar o treinamento.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChange = (index, value) => {
    const updatedLinks = [...links];
    updatedLinks[index] = value;
    setLinks(updatedLinks);
  };

  const addLinkField = () => setLinks([...links, '']);

  const removeLinkField = (index) => {
    const updatedLinks = [...links];
    updatedLinks.splice(index, 1);
    setLinks(updatedLinks);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <form onSubmit={submit} className="bg-white shadow-lg rounded-lg p-8 space-y-6">
        {message.text && (
          <div
            className={`p-4 text-sm rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {message.text}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 block w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 block w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Categoria</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          >
            <option value="">Selecione uma categoria</option>
            <option value="5">Tecnologia</option>
            <option value="6">Gestão</option>
            <option value="7">Marketing</option>
            <option value="4">Outros</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Links</label>
          {links.map((link, index) => (
            <div key={index} className="flex space-x-2 mb-4">
              <input
                type="text"
                value={link}
                onChange={(e) => handleLinkChange(index, e.target.value)}
                className="mt-2 block w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => removeLinkField(index)}
                className="text-red-500 hover:text-red-700 focus:outline-none"
              >
                Remover
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLinkField}
            className="text-blue-500 hover:text-blue-700 focus:outline-none"
          >
            Adicionar Link
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Imagem</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mt-2 block w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar Treinamento'}
          </button>
        </div>
      </form>
    </div>
  );
}
