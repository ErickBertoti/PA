import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function NewPost() {
  const [file, setFile] = useState();
  const [caption, setCaption] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token'); // Recupera o token armazenado no localStorage
    if (!token) {
      alert('Você precisa estar autenticado para realizar esta ação.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('caption', caption);
    formData.append('categoryId', categoryId);

    try {
      await axios.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, // Inclui o token no cabeçalho Authorization
        },
      });

      navigate('/'); // Redireciona para a página inicial após o envio
    } catch (err) {
      console.error('Erro ao enviar o post:', err.response || err);
      alert(err.response?.data?.error || 'Erro ao criar o post.');
    }
  };

  const fileSelected = (event) => {
    const file = event.target.files[0];
    setFile(file);
  };

  const categorySelected = (event) => {
    const categoryId = event.target.value;
    setCategoryId(categoryId);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form
        onSubmit={submit}
        className="flex flex-col space-y-5 p-5 bg-white rounded shadow-md w-1/2"
      >
        <input
          onChange={fileSelected}
          type="file"
          accept="image/*"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          type="text"
          placeholder="Descrição"
          className="block w-full p-2 text-sm text-gray-500 border border-gray-300 rounded"
        />
        <select
          value={categoryId}
          onChange={categorySelected}
          required
          className="block w-full p-2 text-sm text-gray-500 border border-gray-300 rounded">
         <option value="">Selecione uma categoria</option>
         <option value="1">Ícones</option>
         <option value="2">Trabalho</option>
         <option value="3">Educação</option>
         <option value="4">Outros</option>
        </select>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
