import { useState } from 'react';
import axios from 'axios';

export default function NewTraining() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post('/api/trainings', formData, {
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
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao enviar o treinamento.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    setFile(file);
  };

  const categorySelected = (event) => {
    const categoryId = event.target.value;
    setCategoryId(categoryId);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={submit}
        className="flex flex-col space-y-5 p-5 bg-white rounded shadow-md w-full max-w-lg"
      >
        {message.text && (
          <div
            className={`p-3 text-sm rounded ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <div>
          <label
            htmlFor="file"
            className={`block p-10 text-center border-2 ${
              dragging ? 'border-blue-500' : 'border-gray-300'
            } border-dashed rounded transition duration-300`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {file ? (
              <span className="font-bold text-gray-700">{file.name}</span>
            ) : (
              'Arraste e solte o arquivo aqui ou clique para selecionar'
            )}
          </label>
          <input
            id="file"
            type="file"
            accept="video/*,application/pdf,presentation/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          type="text"
          placeholder="Título do Treinamento"
          className="block w-full p-2 text-sm text-gray-500 border border-gray-300 rounded"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição do Treinamento"
          className="block w-full p-2 text-sm text-gray-500 border border-gray-300 rounded"
        />

        <select
          value={categoryId}
          onChange={categorySelected}
          required
          className="block w-full p-2 text-sm text-gray-500 border border-gray-300 rounded"
        >
          <option value="">Selecione uma categoria</option>
          <option value="1">Tecnologia</option>
          <option value="2">Gestão</option>
          <option value="3">Marketing</option>
          <option value="4">Outros</option>
        </select>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar Treinamento'}
        </button>
      </form>
    </div>
  );
}
