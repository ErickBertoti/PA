import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, File, FileText, Trash2, Check, Loader2, Tag, X,
  FileImage, FileVideo, FileAudio
} from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  // Fecha o modal ao clicar fora dele
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target) && !loading) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, loading]);

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
    
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Reset do formulário ao fechar
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setCaption('');
      setCategoryId('');
      setMessage({ type: '', text: '' });
      setUploadProgress(0);
    }
  }, [isOpen]);

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
      
      // Notifica o componente pai sobre o sucesso
      setTimeout(() => {
        onSuccess();
      }, 1500);
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

  // Função para determinar o ícone baseado no tipo MIME do arquivo
  const getFileIcon = (file) => {
    if (!file) return File;
    
    const type = file.type.toLowerCase();
    
    if (type.includes('pdf')) return FileText;
    if (type.includes('image')) return FileImage;
    if (type.includes('video')) return FileVideo;
    if (type.includes('audio')) return FileAudio;
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('xlsx') || type.includes('xls')) return FileText;
    if (type.includes('zip') || type.includes('compressed') || type.includes('archive')) return File;
    if (type.includes('text') || type.includes('document') || type.includes('doc')) return FileText;
    
    return File;
  };

  // Função para obter a cor do ícone baseada no tipo
  const getIconColor = (file) => {
    if (!file) return 'text-gray-400';
    
    const type = file.type.toLowerCase();
    
    if (type.includes('pdf')) return 'text-red-500';
    if (type.includes('image')) return 'text-blue-500';
    if (type.includes('video')) return 'text-purple-500';
    if (type.includes('audio')) return 'text-green-500';
    if (type.includes('spreadsheet') || type.includes('excel')) return 'text-emerald-500';
    if (type.includes('zip') || type.includes('compressed')) return 'text-amber-500';
    if (type.includes('text') || type.includes('document')) return 'text-indigo-500';
    
    return 'text-gray-500';
  };

  const FileIconComponent = file ? getFileIcon(file) : File;
  const iconColorClass = getIconColor(file);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-filter backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 transform transition-all duration-300"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <Upload className="h-6 w-6 text-blue-600" />
            <span>Upload de arquivos</span>
          </h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={submit} className="space-y-6">
          <p className="text-sm text-gray-500">Compartilhe seus documentos facilmente</p>

          {message.text && (
            <div
              className={`p-4 text-sm rounded-lg flex items-center space-x-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="h-5 w-5 flex-shrink-0" />
              ) : (
                <Trash2 className="h-5 w-5 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {loading && (
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
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
                flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer
                ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
                hover:border-blue-500 hover:bg-blue-50 transition duration-300
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-start w-full">
                  <div className="bg-gray-100 rounded-lg p-3 mr-3">
                    <FileIconComponent className={`h-8 w-8 ${iconColorClass}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {file.type || 'Tipo desconhecido'} | {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="mt-2 flex">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          clearFile();
                        }} 
                        className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded flex items-center hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3 py-4">
                  <div className="p-3 bg-blue-50 rounded-full">
                    <Upload className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      Arraste e solte o arquivo aqui
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ou <span className="text-blue-500">selecione um arquivo</span> do seu computador
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    PDF, DOC, XLS, IMAGENS, ÁUDIO, VÍDEO
                  </p>
                </div>
              )}
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <FileText className="w-4 h-4 mr-1 text-gray-500" />
              Descrição
            </label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              type="text"
              placeholder="Descrição do arquivo (opcional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Tag className="w-4 h-4 mr-1 text-gray-500" />
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
              w-full p-3 rounded-lg text-white font-medium transition duration-300
              ${loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:scale-98 shadow-md hover:shadow-lg'
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
                <Upload className="h-5 w-5 mr-1" />
                <span>Fazer Upload</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}