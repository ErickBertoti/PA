import React, { useState, useEffect } from "react";
import { Trash2, Pencil, Plus, AlertCircle, Wrench, Calendar, User, FileText, SortAsc, SortDesc, Filter } from 'lucide-react';
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
  const [filteredTools, setFilteredTools] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });
  const [filterConfig, setFilterConfig] = useState({
    responsible: '',
    usagePeriod: 'all'
  });

  useEffect(() => {
    axios.get("/api/tools")
      .then((response) => {
        setTools(response.data);
        setFilteredTools(response.data);
      })
      .catch((error) => console.error("Erro ao carregar ferramentas:", error));
  }, []);

  useEffect(() => {
    let filtered = [...tools];

    if (filterConfig.responsible) {
      filtered = filtered.filter(tool => 
        tool.responsible.toLowerCase().includes(filterConfig.responsible.toLowerCase())
      );
    }

    if (filterConfig.usagePeriod !== 'all') {
      filtered.sort((a, b) => {
        const periodA = new Date(a.expirationDate) - new Date(a.acquisitionDate);
        const periodB = new Date(b.expirationDate) - new Date(b.acquisitionDate);
        return filterConfig.usagePeriod === 'longest' ? periodB - periodA : periodA - periodB;
      });
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (sortConfig.key === 'acquisitionDate' || sortConfig.key === 'expirationDate') {
          return sortConfig.direction === 'asc' 
            ? new Date(a[sortConfig.key]) - new Date(b[sortConfig.key])
            : new Date(b[sortConfig.key]) - new Date(a[sortConfig.key]);
        }
        return sortConfig.direction === 'asc'
          ? a[sortConfig.key].localeCompare(b[sortConfig.key])
          : b[sortConfig.key].localeCompare(a[sortConfig.key]);
      });
    }

    setFilteredTools(filtered);
  }, [tools, sortConfig, filterConfig]);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const getExpirationStatus = (expirationDate) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - today;
    const diffDays = diffTime / (1000 * 3600 * 24);
    
    if (diffDays <= 7 && diffDays > 0) {
      return 'warning';
    } else if (diffDays <= 0) {
      return 'expired';
    }
    return 'active';
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
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
    if (window.confirm("Tem certeza de que deseja excluir esta ferramenta?")) {
      axios.delete(`/api/tools/${id}`)
        .then(() => {
          axios.get("/api/tools").then((response) => setTools(response.data));
        })
        .catch((error) => console.error("Erro ao deletar ferramenta:", error));
    }
  };

  const handleEdit = (tool) => {
    setFormData(tool);
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Wrench className="h-10 w-10 text-blue-600" />
          <h2 className="text-4xl font-extrabold text-gray-900">Ferramentas e Licenças</h2>
        </div>
        <button
          className="flex items-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <>
              <Trash2 className="h-6 w-6" />
              <span className="font-semibold">Cancelar</span>
            </>
          ) : (
            <>
              <Plus className="h-6 w-6" />
      
              <span className="font-semibold ">Adicionar Ferramenta</span>
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-2xl mb-8 border-2 border-indigo-100">
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

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6 border border-gray-100">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="h-6 w-6 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-800">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Responsável
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                placeholder="Digite o nome do responsável"
                value={filterConfig.responsible}
                onChange={(e) => setFilterConfig(prev => ({
                  ...prev,
                  responsible: e.target.value
                }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período de Uso
            </label>
            <select
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              value={filterConfig.usagePeriod}
              onChange={(e) => setFilterConfig(prev => ({
                ...prev,
                usagePeriod: e.target.value
              }))}
            >
              <option value="all">Todos</option>
              <option value="longest">Maior Período</option>
              <option value="shortest">Menor Período</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {tools.length === 0 ? (
        <div className="text-center bg-white p-16 rounded-2xl shadow-lg">
          <Wrench className="h-20 w-20 text-blue-300 mx-auto mb-6" />
          <p className="text-2xl font-bold text-gray-800 mb-4">Nenhuma ferramenta ou licença cadastrada</p>
          <p className="text-lg text-gray-600">Adicione novas ferramentas ou licenças usando o botão acima</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    { key: 'name', label: 'Nome' },
                    { key: 'description', label: 'Descrição' },
                    { key: 'responsible', label: 'Responsável', sortable: true },
                    { key: 'acquisitionDate', label: 'Aquisição', sortable: true },
                    { key: 'expirationDate', label: 'Expiração', sortable: true },
                    { key: 'actions', label: 'Ações', className: 'text-center' }
                  ].map(({ key, label, sortable = false, className }) => (
                    <th 
                      key={key} 
                      className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className || ''}`}
                    >
                      {sortable ? (
                        <button 
                          className="flex items-center space-x-2 hover:text-indigo-600 transition-colors"
                          onClick={() => handleSort(key)}
                        >
                          <span>{label}</span>
                          {sortConfig.key === key && (
                            sortConfig.direction === 'asc' 
                              ? <SortAsc className="h-4 w-4" /> 
                              : <SortDesc className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTools.map((tool) => {
                  const expirationStatus = getExpirationStatus(tool.expirationDate);
                  return (
                    <tr 
                      key={tool.id} 
                      className={`hover:bg-blue-50 transition-colors duration-200 ${
                        expirationStatus === 'expired' 
                          ? 'bg-red-50 text-red-800' 
                          : expirationStatus === 'warning' 
                          ? 'bg-yellow-50 text-yellow-800' 
                          : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tool.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{tool.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tool.responsible}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(tool.acquisitionDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(tool.expirationDate)}
                        {expirationStatus === 'warning' && (
                          <span className="ml-2 text-yellow-600 font-semibold">
                            (Expira em breve!)
                          </span>
                        )}
                        {expirationStatus === 'expired' && (
                          <span className="ml-2 text-red-600 font-semibold">
                            (Expirado!)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-3">
                          {expirationStatus === 'warning' && (
                            <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />
                          )}
                          <button
                            onClick={() => handleEdit(tool)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tool.id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsAndLicenses;