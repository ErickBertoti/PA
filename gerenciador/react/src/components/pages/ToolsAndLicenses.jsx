import React, { useState, useEffect } from "react";
import { Trash2, Pencil, Plus, AlertCircle, Calendar, User, FileText } from 'lucide-react';
import axios from "axios";

const ToolsAndLicenses = () => {
  const [tools, setTools] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    responsible: "",
    acquisitionDate: "",
    expirationDate: "",
  });

  // Existing useEffect and helper functions remain the same
  useEffect(() => {
    axios.get("/api/tools")
      .then((response) => setTools(response.data))
      .catch((error) => console.error("Erro ao carregar ferramentas:", error));
  }, []);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const isExpiringSoon = (expirationDate) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - today;
    const diffDays = diffTime / (1000 * 3600 * 24);
    return diffDays <= 7 && diffDays > 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (new Date(formData.acquisitionDate) > new Date(formData.expirationDate)) {
      alert("A data de aquisição não pode ser posterior à data de expiração.");
      return;
    }

    if (formData.id) {
      axios.put(`/api/tools/${formData.id}`, formData)
        .then(() => {
          setShowForm(false);
          setFormData({});
          axios.get("/api/tools").then((response) => setTools(response.data));
        })
        .catch((error) => console.error("Erro ao atualizar ferramenta:", error));
    } else {
      axios.post("/api/tools", formData)
        .then(() => {
          setShowForm(false);
          setFormData({});
          axios.get("/api/tools").then((response) => setTools(response.data));
        })
        .catch((error) => console.error("Erro ao adicionar ferramenta:", error));
    }
  };

  const handleDelete = (id) => {
    axios.delete(`/api/tools/${id}`)
      .then(() => {
        axios.get("/api/tools").then((response) => setTools(response.data));
      })
      .catch((error) => console.error("Erro ao deletar ferramenta:", error));
  };

  const handleEdit = (tool) => {
    setFormData(tool);
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <Pencil className="h-8 w-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-800">Ferramentas e Licenças</h2>
        </div>
        <button
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <>
              <Trash2 className="h-5 w-5" />
              <span>Cancelar</span>
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              <span>Adicionar Ferramenta</span>
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            {formData.id ? "Editar Ferramenta" : "Nova Ferramenta"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-3">
              <Pencil className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="p-3 border-2 border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="description"
                placeholder="Descrição"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="p-3 border-2 border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="responsible"
                placeholder="Responsável"
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                className="p-3 border-2 border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="acquisitionDate"
                  value={formData.acquisitionDate}
                  onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                  className="p-3 border-2 border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  className="p-3 border-2 border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              {formData.id ? (
                <>
                  <Pencil className="h-5 w-5" />
                  <span>Atualizar</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>Adicionar</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {tools.length === 0 ? (
        <div className="text-center text-gray-600 p-12 bg-white rounded-xl shadow-lg">
          <Pencil className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl font-semibold">Nenhuma ferramenta ou licença cadastrada ainda.</p>
          <p className="mt-2 text-lg text-gray-500">Adicione novas ferramentas ou licenças utilizando o botão acima.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="px-6 py-4 text-left font-semibold">Nome</th>
                  <th className="px-6 py-4 text-left font-semibold">Descrição</th>
                  <th className="px-6 py-4 text-left font-semibold">Responsável</th>
                  <th className="px-6 py-4 text-left font-semibold">Aquisição</th>
                  <th className="px-6 py-4 text-left font-semibold">Expiração</th>
                  <th className="px-6 py-4 text-center font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">{tool.name}</td>
                    <td className="px-6 py-4">{tool.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{tool.responsible}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(tool.acquisitionDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(tool.expirationDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-3">
                        {isExpiringSoon(tool.expirationDate) && (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                        <button
                          onClick={() => handleEdit(tool)}
                          className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tool.id)}
                          className="text-red-600 hover:text-red-700 transition-colors duration-200"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsAndLicenses;