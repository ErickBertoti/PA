import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

export const uploadDocument = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/documents/upload', formData);
};

export const getDocuments = () => API.get('/documents');
