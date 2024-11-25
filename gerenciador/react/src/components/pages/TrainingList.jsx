import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TrainingList = () => {
  const [trainings, setTrainings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    axios.get('/api/trainings').then((response) => {
      setTrainings(response.data);
    });
    axios.get('/api/categories').then((response) => {
      setCategories(response.data);
    });
  }, []);

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch = training.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = categoryFilter
      ? training.categoryId === Number(categoryFilter)
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Lista de Treinamentos</h2>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por título"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded w-full"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-4">
        {filteredTrainings.map((training) => (
          <li
            key={training.id}
            className="bg-white p-4 rounded shadow-md flex flex-col gap-2"
          >
            <h3 className="text-xl font-bold">{training.title}</h3>
            <p>{training.description}</p>
            <p className="text-sm text-gray-500">
              Categoria: {categories.find((c) => c.id === training.categoryId)?.name}
            </p>
            <ul className="mt-2">
              {training.trainingLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {link.url}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrainingList;
