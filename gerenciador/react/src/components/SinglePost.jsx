import { TrashIcon, DownloadIcon } from '@heroicons/react/solid';
import pdfIcon from './assets/pdf_icon.png';
import xlsxIcon from './assets/xlsx_icon.png';
import docxIcon from './assets/docx_icon.png';
import imgIcon from './assets/img_icon.png';

export default function SinglePost({ className, post, category, deletePostClicked, downloadFile }) {
  const { id, caption, fileUrl } = post;

  // Função para determinar o ícone com base no tipo de arquivo
  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return imgIcon; // Retorna o ícone de imagem padrão se o fileUrl não for válido

    const extension = fileUrl.split('.').pop().toLowerCase();

    switch (extension) {
      case 'pdf':
        return pdfIcon;
      case 'xlsx':
        return xlsxIcon;
      case 'docx':
        return docxIcon;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return imgIcon;
      default:
        return imgIcon; // Ícone padrão para arquivos desconhecidos
    }
  };

  return (
    <div className={`${className} outline-1 w-300`}>
      <div className="flex flex-col space-y-2">
        <div className="flex flex-row items-center space-x-4 cursor-pointer active:opacity-80">
          {/* Ícone dinâmico baseado no tipo de arquivo */}
          <img 
            src={getFileIcon(fileUrl)} 
            alt="File icon" 
            className="h-10 w-10"
          />
          <p className="text-sm">{category}</p>
        </div>
        <p className="text-xs">{caption}</p>
        <div className="flex flex-row items-end space-x-4 justify-center">
          {/* Pré-visualização para imagens */}
          {['jpg', 'jpeg', 'png', 'gif'].includes(fileUrl?.split('.').pop().toLowerCase()) && (
            <img className="rounded" width="150" height="200" src={fileUrl} alt="Preview" />
          )}
          {/* Ações */}
          <div className="flex flex-col items-center">
            <TrashIcon
              className="cursor-pointer hover:text-gray-900 active:text-gray-700 h-10 w-10 text-gray-700"
              onClick={() => deletePostClicked({ id })}
            />
            <DownloadIcon
              className="cursor-pointer hover:text-gray-900 active:text-gray-700 h-10 w-10 text-gray-700"
              onClick={() => downloadFile({ id })}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 
