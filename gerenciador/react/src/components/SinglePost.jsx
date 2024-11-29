import { File, Download, Trash2, X, Maximize2, FileVideo, FileAudio, FileImage } from 'lucide-react';
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

  // Funcão para ler tipo de ícone pro arquivo baseado no mime type
  const getFileIcon = (type) => {
    const fileIcons = {
      'image': FileImage,
      'video': FileVideo,
      'audio': FileAudio,
      'application/pdf': File,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': File,
      'application/vnd.ms-excel': File,
      'application/zip': File,
      'application/x-zip-compressed': File,
      'default': File
    };

    const iconComponent = Object.entries(fileIcons).find(([key]) => 
      type.includes(key)
    )?.[1] || fileIcons.default;

    return iconComponent;
  };

  const FileIconComponent = getFileIcon(fileType);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden w-64">
        {/* Header com a categoria */}
        <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <File className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">{category}</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => downloadFile({ id })}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
              title="Download file"
            >
              <Download className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
              title="Delete file"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* Preview do arquivo */}
        <div 
          className="relative h-40 cursor-pointer group"
          onClick={() => setShowFullPreview(true)}
        >
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <FileIconComponent className="w-16 h-16 text-gray-500" />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
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
        </div>
      </div>

      {/* Preview Completa */}
      {showFullPreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullPreview(false)}
        >
          <div 
            className="relative max-w-sm w-full bg-white rounded-lg p-4" 
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFullPreview(false)}
              className="absolute -right-2 -top-2 p-1 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex flex-col items-center">
              <FileIconComponent className="w-24 h-24 text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{originalFileName}</h3>
              <p className="text-sm text-gray-600 mb-4">{caption}</p>
              <p className="text-xs text-gray-500">Tipo de arquivo: {fileType}</p>
              <button
                onClick={() => downloadFile({ id })}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Baixar arquivo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que quer deletar o arquivo? Não poderá reverter após.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md border border-gray-300 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors duration-200"
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