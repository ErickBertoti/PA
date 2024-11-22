import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TrainingList() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const { data } = await axios.get('/api/trainings');
        setTrainings(data);
      } catch (error) {
        console.error('Erro ao buscar treinamentos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  if (loading) {
    return <p>Carregando treinamentos...</p>;
  }

  if (trainings.length === 0) {
    return <p>Nenhum treinamento disponível.</p>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Treinamentos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainings.map((training) => (
          <div
            key={training.id}
            className="bg-white shadow-md rounded p-4 flex flex-col items-start"
          >
            <h3 className="text-lg font-bold">{training.title}</h3>
            <p>{training.description}</p>
            <ul className="mt-2">
              {training.trainingLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    {link.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
