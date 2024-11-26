import { File, Download, Trash2, X, Maximize2 } from 'lucide-react';
import { useState } from 'react';

export default function SinglePost({ post, category, deletePostClicked, downloadFile }) {
  const { id, caption, imageUrl } = post;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deletePostClicked({ id });
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden w-64">
        {/* Cabeçalho com categoria */}
        <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <File className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">{category}</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => downloadFile({ id })}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
              title="Download arquivo"
            >
              <Download className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
              title="Excluir arquivo"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* Preview da imagem com overlay de ampliação */}
        {imageUrl && (
          <div 
            className="relative h-40 cursor-pointer group"
            onClick={() => setShowFullImage(true)}
          >
            <img
              src={imageUrl}
              alt={caption}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
            </div>
          </div>
        )}

        {/* Legenda */}
        <div className="px-4 py-2">
          <p className="text-sm text-gray-600 truncate">{caption}</p>
        </div>
      </div>

      {/* Modal de visualização completa */}
      {showFullImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div 
            className="relative max-w-sm w-full" 
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute -right-2 -top-2 p-1 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <img
              src={imageUrl}
              alt={caption}
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <p className="mt-2 text-center text-white text-sm">{caption}</p>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir este arquivo? Esta ação não pode ser desfeita.
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
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}