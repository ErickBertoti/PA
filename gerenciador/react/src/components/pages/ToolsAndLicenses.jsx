import React, { useState, useEffect } from "react";
import { TrashIcon, PencilIcon, PlusIcon, ExclamationCircleIcon } from "@heroicons/react/solid";
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

  // Carregar ferramentas e licenças
  useEffect(() => {
    axios.get("/api/tools")
      .then((response) => setTools(response.data))
      .catch((error) => console.error("Erro ao carregar ferramentas:", error));
  }, []);

  // Função para formatar datas (só exibir dia/mês/ano)
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  // Função para verificar se a data está prestes a expirar (1 semana ou menos)
  const isExpiringSoon = (expirationDate) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - today;
    const diffDays = diffTime / (1000 * 3600 * 24); // Diferença em dias
    return diffDays <= 7 && diffDays > 0;
  };

  // Função para lidar com a inserção/atualização de dados
  const handleSubmit = (e) => {
    e.preventDefault();

    // Verificar se a data de aquisição é posterior à data de expiração
    if (new Date(formData.acquisitionDate) > new Date(formData.expirationDate)) {
      alert("A data de aquisição não pode ser posterior à data de expiração.");
      return;
    }

    if (formData.id) {
      axios.put(`/api/tools/${formData.id}`, formData)
        .then(() => {
          setShowForm(false);
          setFormData({});
          // Recarregar dados
          axios.get("/api/tools").then((response) => setTools(response.data));
        })
        .catch((error) => console.error("Erro ao atualizar ferramenta:", error));
    } else {
      axios.post("/api/tools", formData)
        .then(() => {
          setShowForm(false);
          setFormData({});
          // Recarregar dados
          axios.get("/api/tools").then((response) => setTools(response.data));
        })
        .catch((error) => console.error("Erro ao adicionar ferramenta:", error));
    }
  };

  // Função para deletar ferramenta
  const handleDelete = (id) => {
    axios.delete(`/api/tools/${id}`)
      .then(() => {
        // Recarregar dados
        axios.get("/api/tools").then((response) => setTools(response.data));
      })
      .catch((error) => console.error("Erro ao deletar ferramenta:", error));
  };

  // Função para editar ferramenta
  const handleEdit = (tool) => {
    setFormData(tool);
    setShowForm(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Ferramentas e Licenças</h2>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          onClick={() => setShowForm(!showForm)}
        >
          <PlusIcon className="h-5 w-5" />
          <span>{showForm ? "Cancelar" : "Adicionar Ferramenta"}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <input
            type="text"
            name="name"
            placeholder="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="p-2 border-2 border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="p-2 border-2 border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            name="responsible"
            placeholder="Responsável"
            value={formData.responsible}
            onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
            className="p-2 border-2 border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="flex space-x-4">
            <input
              type="date"
              name="acquisitionDate"
              value={formData.acquisitionDate}
              onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
              className="p-2 border-2 border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="date"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              className="p-2 border-2 border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
          >
            {formData.id ? "Atualizar" : "Adicionar"}
          </button>
        </form>
      )}

      {/* Verificar se a lista de ferramentas está vazia */}
      {tools.length === 0 ? (
        <div className="text-center text-gray-600 p-6">
          <p className="text-xl">Nenhuma ferramenta ou licença cadastrada ainda.</p>
          <p className="mt-2 text-lg">Adicione novas ferramentas ou licenças utilizando o botão acima.</p>
        </div>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-md">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-2 border-b">Nome</th>
              <th className="px-4 py-2 border-b">Descrição</th>
              <th className="px-4 py-2 border-b">Responsável</th>
              <th className="px-4 py-2 border-b">Aquisição</th>
              <th className="px-4 py-2 border-b">Expiração</th>
              <th className="px-4 py-2 border-b">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool) => (
              <tr key={tool.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2 border-b text-center">{tool.name}</td>
                <td className="px-4 py-2 border-b text-center">{tool.description}</td>
                <td className="px-4 py-2 border-b text-center" >{tool.responsible}</td>
                <td className="px-4 py-2 border-b text-center">{formatDate(tool.acquisitionDate)}</td>
                <td className="px-4 py-2 border-b text-center">{formatDate(tool.expirationDate)}</td>
                <td className="px-4 py-2 border-b text-center">
                  {isExpiringSoon(tool.expirationDate) && (
                    <button
                      className="text-yellow-500 hover:text-yellow-600"
                      title="Licença prestes a expirar"
                    >
                      <ExclamationCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(tool)}
                    className="text-yellow-500 hover:text-yellow-600 mr-2"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(tool.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ToolsAndLicenses;
