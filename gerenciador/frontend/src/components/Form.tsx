import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Form: React.FC = () => {
    const [formData, setFormData] = useState<FormData>(new FormData());
    const [fileName, setFileName] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const newFormData = new FormData();
            newFormData.append('file', e.target.files[0]);
            setFormData(newFormData);
            setFileName(e.target.files[0].name);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Evita o recarregamento da página
        try {
            await axios.post('http://localhost:5000/upload', formData);
            toast.success('Upload realizado com sucesso!');
            setFormData(new FormData()); // Limpa o FormData
            setFileName(''); // Limpa o campo de nome do arquivo
        } catch (error) {
            toast.error('Erro no upload!');
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
            <h2 className="text-2xl font-bold mb-4">Upload de Arquivos</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                        Escolha um arquivo
                    </label>
                    <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    />
                    {fileName && (
                        <p className="text-sm text-gray-500 mt-1">Arquivo selecionado: {fileName}</p>
                    )}
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                >
                    Enviar
                </button>
            </form>
            <ToastContainer />
        </div>
    );
};

export default Form;
