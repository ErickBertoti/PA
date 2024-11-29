import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, File, FileText, Trash2, Check, Loader2, Tag } from 'lucide-react';

export default function NewPost() {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // Busca as categorias na API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        setMessage({ 
          type: 'error', 
          text: 'Não foi possível carregar as categorias' 
        });
      }
    }
    fetchCategories();
  }, []);

  const submit = async (event) => {
    event.preventDefault();

    //Verifica autenticação
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', text: 'Você precisa de autenticação para fazer isso' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    formData.append('categoryId', categoryId);

    setLoading(true);
    setUploadProgress(0);
    setMessage({ type: '', text: '' });

    try {
      await axios.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      setMessage({ type: 'success', text: 'Arquivo enviado com sucesso!' });
      setFile(null);
      setCaption('');
      setCategoryId('');
      setUploadProgress(100);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao fazer Upload.' });
    } finally {
      setTimeout(() => {
        setLoading(false);
        setUploadProgress(0);
      }, 1500);
    }
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
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
    const droppedFile = event.dataTransfer.files[0];
    setFile(droppedFile);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const categorySelected = (event) => {
    const selectedCategoryId = event.target.value;
    setCategoryId(selectedCategoryId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 transform transition-all duration-300 hover:scale-105">
        <form onSubmit={submit} className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center space-x-2">
              <Upload className="h-6 w-6 text-blue-600" />
              <span>Upload de arquivos</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2">Compartilhe seu documentos facilmente</p>
          </div>

          {message.text && (
            <div
              className={`p-3 text-sm rounded-lg flex items-center space-x-2 ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="h-5 w-5" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {loading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <div>
            <input
              ref={fileInputRef}
              id="file"
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="file"
              className={`
                flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer
                ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
                hover:border-blue-500 hover:bg-blue-50 transition duration-300
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      clearFile();
                    }} 
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <File className="h-10 w-10 text-gray-400" />
                  <p className="text-sm text-gray-500 text-center">
                    Arraste e solte o arquivo aqui ou clique para selecionar
                  </p>
                </div>
              )}
            </label>
          </div>

          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            type="text"
            placeholder="Descrição"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <div>
            <label className="flex items-center font-semibold mb-2 text-gray-700">
              <Tag className="w-4 h-4 mr-2 text-blue-500" />
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={categorySelected}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-700"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className={`
              w-full p-3 rounded-lg text-white font-semibold transition duration-300
              ${loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              } flex items-center justify-center space-x-2
            `}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Upload</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}