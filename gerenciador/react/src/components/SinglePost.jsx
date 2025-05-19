import { 
  File, Download, Trash2, X, Maximize2, 
  FileVideo, FileAudio, FileImage, FileText,
  Calendar, Tag, AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function SinglePost({ post, category, deletePostClicked, downloadFile }) {
  const { id, caption, imageName, fileType, originalFileName, createdAt } = post;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Animação de entrada
    setAnimateIn(true);
  }, []);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePostClicked({ id });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadFile({ id });
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
      }, 1000);
    }
  };

  // Função aprimorada para exibir ícones específicos para cada tipo de arquivo
  const getFileIcon = (type) => {
    // Mapeamento de tipos MIME para ícones específicos
    if (type.includes('image')) return FileImage;
    if (type.includes('video')) return FileVideo;
    if (type.includes('audio')) return FileAudio;
    if (type.includes('pdf')) return FileText;
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('xlsx') || type.includes('xls')) return FileText;
    if (type.includes('zip') || type.includes('compressed') || type.includes('archive')) return File;
    if (type.includes('text') || type.includes('document') || type.includes('docx') || type.includes('doc')) return FileText;
    return File; // Ícone padrão para outros tipos
  };

  const FileIconComponent = getFileIcon(fileType);
  
  // Definir uma cor de fundo baseada no tipo do arquivo para melhor distinção visual
  const getFileColorClass = (type) => {
    if (type.includes('image')) return 'from-blue-100 to-blue-50';
    if (type.includes('video')) return 'from-purple-100 to-purple-50';
    if (type.includes('audio')) return 'from-green-100 to-green-50';
    if (type.includes('pdf')) return 'from-red-100 to-red-50';
    if (type.includes('spreadsheet') || type.includes('excel')) return 'from-emerald-100 to-emerald-50';
    if (type.includes('zip') || type.includes('compressed')) return 'from-amber-100 to-amber-50';
    if (type.includes('text') || type.includes('document')) return 'from-indigo-100 to-indigo-50';
    return 'from-gray-100 to-gray-50';
  };

  const getIconColorClass = (type) => {
    if (type.includes('image')) return 'text-blue-500';
    if (type.includes('video')) return 'text-purple-500';
    if (type.includes('audio')) return 'text-green-500';
    if (type.includes('pdf')) return 'text-red-500';
    if (type.includes('spreadsheet') || type.includes('excel')) return 'text-emerald-500';
    if (type.includes('zip') || type.includes('compressed')) return 'text-amber-500';
    if (type.includes('text') || type.includes('document')) return 'text-indigo-500';
    return 'text-gray-500';
  };

  const getBorderColorClass = (type) => {
    if (type.includes('image')) return 'border-blue-200';
    if (type.includes('video')) return 'border-purple-200';
    if (type.includes('audio')) return 'border-green-200';
    if (type.includes('pdf')) return 'border-red-200';
    if (type.includes('spreadsheet') || type.includes('excel')) return 'border-emerald-200';
    if (type.includes('zip') || type.includes('compressed')) return 'border-amber-200';
    if (type.includes('text') || type.includes('document')) return 'border-indigo-200';
    return 'border-gray-200';
  };

  const fileColorClass = getFileColorClass(fileType);
  const iconColorClass = getIconColorClass(fileType);
  const borderColorClass = getBorderColorClass(fileType);

  // Formatar data de criação
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Renderizar modais usando portal
  const renderPreviewModal = () => {
    if (!showFullPreview) return null;
    
    return ReactDOM.createPortal(
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn"
        onClick={() => setShowFullPreview(false)}
      >
        <div 
          className="relative max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl transform transition-all duration-300 animate-scaleIn" 
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowFullPreview(false)}
            className="absolute -right-3 -top-3 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-all duration-200 z-10 group"
          >
            <X className="w-5 h-5 text-gray-600 group-hover:rotate-90 transition-transform" />
          </button>
          
          <div className="flex flex-col items-center">
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${fileColorClass} flex items-center justify-center mb-6 shadow-inner`}>
              <FileIconComponent className={`w-12 h-12 ${iconColorClass}`} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{originalFileName}</h3>
            {caption && (
              <p className="text-sm text-gray-600 mb-6 text-center max-w-xs">
                {caption}
              </p>
            )}
            
            <div className="w-full bg-gray-50/80 backdrop-blur-sm rounded-xl p-5 mb-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500 flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-gray-400" />
                  Tipo de arquivo:
                </span>
                <span className="text-sm font-semibold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                  {fileType}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500 flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-gray-400" />
                  Categoria:
                </span>
                <span className="text-sm font-semibold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                  {category}
                </span>
              </div>
              {createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Data de criação:
                  </span>
                  <span className="text-sm font-semibold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                    {formatDate(createdAt)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex w-full space-x-4">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="group relative flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-200/50 transition-all duration-300 flex items-center justify-center font-medium disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 group-hover:blur-sm transition-all duration-300 rounded-xl"></span>
                <span className="relative flex items-center justify-center">
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Baixando...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Baixar arquivo
                    </>
                  )}
                </span>
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-3 border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-50 transition-all duration-300 flex items-center justify-center transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // Renderizar modal de confirmação de exclusão usando portal
  const renderDeleteConfirmModal = () => {
    if (!showDeleteConfirm) return null;
    
    return ReactDOM.createPortal(
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-scaleIn">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-xl bg-red-100 mr-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              Confirmar exclusão
            </h3>
          </div>
          
          <p className="text-gray-600 mb-8">
            Tem certeza que quer deletar o arquivo <span className="font-semibold">"{originalFileName}"</span>? Esta ação não poderá ser revertida.
          </p>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl border border-gray-300 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="group relative px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-200/50 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 group-hover:blur-sm transition-all duration-300 rounded-xl"></span>
              <span className="relative flex items-center justify-center">
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deletando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border ${borderColorClass} transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        style={{ transitionDelay: '100ms' }}>
        {/* Header com a categoria */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-gray-50 to-white border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${fileColorClass}`}>
              <FileIconComponent className={`w-4 h-4 ${iconColorClass}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">{category}</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center group relative"
              title="Download arquivo"
            >
              {isDownloading ? (
                <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Download className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
              )}
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Download
              </span>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors duration-200 flex items-center justify-center group relative"
              title="Deletar arquivo"
            >
              <Trash2 className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Deletar
              </span>
            </button>
          </div>
        </div>

        {/* Preview do arquivo */}
        <div 
          className="relative h-44 cursor-pointer group overflow-hidden"
          onClick={() => setShowFullPreview(true)}
        >
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${fileColorClass}`}>
            <FileIconComponent className={`w-20 h-20 ${iconColorClass} transform group-hover:scale-110 transition-transform duration-300`} />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center backdrop-blur-sm backdrop-filter-none group-hover:backdrop-blur-sm">
            <div className="bg-white/80 backdrop-blur-sm p-2.5 rounded-full opacity-0 transform scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg">
              <Maximize2 className="w-5 h-5 text-gray-700" />
            </div>
          </div>
        </div>

        {/* Nome do arquivo e descrição */}
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-1.5 truncate" title={originalFileName}>
            {originalFileName}
          </h3>
          {caption && (
            <p className="text-xs text-gray-600 truncate mb-2" title={caption}>
              {caption}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400 flex items-center">
              <Tag className="w-3.5 h-3.5 mr-1.5" />
              {fileType.split('/')[1]?.toUpperCase() || fileType}
            </p>
            {createdAt && (
              <p className="text-xs text-gray-400 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                {formatDate(createdAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Renderizar modais usando portais */}
      {renderPreviewModal()}
      {renderDeleteConfirmModal()}

      {/* Estilos para animações */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
