import React, { useState, useEffect } from 'react';
import { uploadDocument, getDocuments } from '../api';

const Home: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const { data } = await getDocuments();
    setDocuments(data);
  };

  const handleUpload = async () => {
    if (!file) return;
    await uploadDocument(file);
    setFile(null);
    fetchDocuments();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Upload a Document</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
      />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white p-2 mt-2"
      >
        Upload
      </button>

      <h2 className="text-xl font-bold mt-6">Documents</h2>
      <ul>
        {documents.map((doc) => (
          <li key={doc.id} className="border-b py-2">
            {doc.name} - {doc.category}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
