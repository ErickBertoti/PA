import { useEffect, useState } from 'react'
import axios from 'axios'

import SinglePost from '../SinglePost'

import { useNavigate } from 'react-router-dom'

function App() {  

  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState({})
  let navigate = useNavigate();

  useEffect(() => {
    async function getPostsAndCategories() {
      const [postsResponse, categoriesResponse] = await Promise.all([
        axios.get("/api/posts"),
        axios.get("/api/categories")
      ])

      setPosts(postsResponse.data)
      const categoriesMap = categoriesResponse.data.reduce((acc, category) => {
        acc[category.id] = category.name
        return acc
      }, {})
      setCategories(categoriesMap)
    }
    getPostsAndCategories()
  }, [])

  const editPostClicked = ({id}) => {
    navigate("/editPost/" + id)
    console.log(`editPostClicked = (${id})`)
  }

  const deletePostClicked = async ({ id }) => {
    console.log(`deletePostClicked = (${id})`);
  
    try {
      await axios.delete(`/api/posts/${id}`);
      setPosts(posts.filter(post => post.id !== id)); // Atualiza a lista localmente
    } catch (error) {
      console.error(error.response?.data || error.message); // Log de erros
      alert("Não foi possível deletar o post. Verifique sua autenticação.");
    }
  };
  
  const downloadFile = async ({ id }) => {
    try {
      // Obtém a URL assinada da API
      const { data } = await axios.get(`/api/posts/${id}/image`);
      const fileUrl = data.url;
  
      // Faz o download do arquivo
      const response = await axios.get(fileUrl, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = URL.createObjectURL(blob);
  
      // Cria o link para download
      const a = document.createElement('a');
      a.href = url;
      a.download = `post-${id}.${response.headers['content-type'].split('/')[1]}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
    }
  };
  

  const postActions = {
    editPostClicked,
    deletePostClicked,
    downloadFile
  }

  return (
    <div className="App h-screen bg-gray-100 flex flex-col items-center justify-center">

      {posts.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-md shadow-md">
          <h1 className="text-3xl font-bold text-gray-800">Nenhum documento registrado</h1>
          <p className="text-gray-600 mt-4">Por favor, adicione um novo documento para começar a gerenciar seus arquivos.</p>
          <button
            onClick={() => navigate('/newPost')}
            className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Registrar Novo Arquivo
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center space-y-4 items-center divide-y divide-gray-200 py-10">
          {posts.map(post => (
            <div key={`post-${post.id}`} className="px-5 py-5 bg-white rounded-md shadow-md w-300 mx-4 my-4">

              <SinglePost className="relative" post={post} category={categories[post.categoryId]} deletePostClicked={deletePostClicked} downloadFile={postActions.downloadFile}></SinglePost>
              
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default App
