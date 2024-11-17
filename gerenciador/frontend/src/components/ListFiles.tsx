import React, { useEffect, useState } from 'react';
import api from '../api';

interface File {
  key: string;
  url: string;
}

const FileList: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await api.get('/files');
        setFiles(response.data);
      } catch (error) {
        console.error('Erro ao listar arquivos', error);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div>
      <h1>Lista de Arquivos</h1>
      <ul>
        {files.map((file) => (
          <li key={file.key}>
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              {file.key}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;
