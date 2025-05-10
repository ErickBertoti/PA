import { 
  File, Download, Trash2, X, Maximize2, 
  FileVideo, FileAudio, FileImage, FileText 
} from 'lucide-react';
import { useState } from 'react';

export default function SinglePost({ post, category, deletePostClicked, downloadFile }) {
  const { id, caption, imageName, fileType, originalFileName } = post;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deletePostClicked({ id });
    setShowDeleteConfirm(false);
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
    if (type.includes('image')) return 'bg-blue-50';
    if (type.includes('video')) return 'bg-purple-50';
    if (type.includes('audio')) return 'bg-green-50';
    if (type.includes('pdf')) return 'bg-red-50';
    if (type.includes('spreadsheet') || type.includes('excel')) return 'bg-emerald-50';
    if (type.includes('zip') || type.includes('compressed')) return 'bg-amber-50';
    if (type.includes('text') || type.includes('document')) return 'bg-indigo-50';
    return 'bg-gray-50';
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

  const fileColorClass = getFileColorClass(fileType);
  const iconColorClass = getIconColorClass(fileType);

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden w-64 border border-gray-100">
        {/* Header com a categoria */}
        <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileIconComponent className={`w-4 h-4 ${iconColorClass}`} />
            <span className="text-sm font-medium text-gray-700">{category}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => downloadFile({ id })}
              className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
              title="Download file"
            >
              <Download className="w-4 h-4 text-blue-500" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-full hover:bg-red-100 transition-colors duration-200 flex items-center justify-center"
              title="Delete file"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* Preview do arquivo */}
        <div 
          className="relative h-40 cursor-pointer group overflow-hidden"
          onClick={() => setShowFullPreview(true)}
        >
          <div className={`w-full h-full flex items-center justify-center ${fileColorClass}`}>
            <FileIconComponent className={`w-16 h-16 ${iconColorClass}`} />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <Maximize2 className="w-8 h-8 text-white opacity-0 transform scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
          </div>
        </div>

        {/* Nome do arquivo e descrição */}
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-1 truncate" title={originalFileName}>
            {originalFileName}
          </h3>
          {caption && (
            <p className="text-xs text-gray-600 truncate" title={caption}>
              {caption}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1 truncate">
            {fileType.split('/')[1]?.toUpperCase() || fileType}
          </p>
        </div>
      </div>

      {/* Preview Completa - Modal aprimorado */}
      {showFullPreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowFullPreview(false)}
        >
          <div 
            className="relative max-w-md w-full bg-white rounded-xl p-6 shadow-2xl transform transition-all duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFullPreview(false)}
              className="absolute -right-3 -top-3 p-1.5 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all duration-200 z-10"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full ${fileColorClass} flex items-center justify-center mb-4`}>
                <FileIconComponent className={`w-10 h-10 ${iconColorClass}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">{originalFileName}</h3>
              {caption && <p className="text-sm text-gray-600 mb-4 text-center">{caption}</p>}
              
              <div className="w-full bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">Tipo de arquivo:</span>
                  <span className="text-sm font-semibold bg-gray-200 px-2 py-1 rounded-md">{fileType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Categoria:</span>
                  <span className="text-sm font-semibold">{category}</span>
                </div>
              </div>
              
              <div className="flex w-full space-x-3">
                <button
                  onClick={() => downloadFile({ id })}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Baixar arquivo
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-red-100 mr-3">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar exclusão
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Tem certeza que quer deletar o arquivo "{originalFileName}"? Esta ação não poderá ser revertida.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}