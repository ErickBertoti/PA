import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import SinglePost from '../SinglePost'
import { FolderPlus, FileQuestion,Loader2 } from 'lucide-react'

function App() {  
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  let navigate = useNavigate()

  useEffect(() => {
    async function getPostsAndCategories() {
      try {
        setIsLoading(true)
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
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }
    getPostsAndCategories()
  }, [])

  const editPostClicked = ({id}) => {
    navigate("/editPost/" + id)
  }

  const deletePostClicked = async ({ id }) => {
    try {
      await axios.delete(`/api/posts/${id}`)
      setPosts(posts.filter(post => post.id !== id))
    } catch (error) {
      console.error(error.response?.data || error.message)
      alert("Não foi possível deletar o post. Verifique sua autenticação.")
    }
  }
  
  const downloadFile = async ({id}) => {
    try {
      const response = await axios.get(`/api/posts/${id}/image`, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `post-${id}.${response.headers['content-type'].split('/')[1]}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
    }
  }


  const postActions = {
    editPostClicked,
    deletePostClicked,
    downloadFile
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Carregando documentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Documentos</h1>
          <button
            onClick={() => navigate('/newPost')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <FolderPlus className="w-5 h-5 mr-2" />
            Novo Documento
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FileQuestion className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Nenhum documento registrado</h2>
            <p className="text-gray-600 mb-6">
              Comece adicionando seu primeiro documento ao sistema.
            </p>
            <button
              onClick={() => navigate('/newPost')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <FolderPlus className="w-5 h-5 mr-2" />
              Registrar Novo Arquivo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <div 
                key={`post-${post.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <SinglePost 
                    post={post} 
                    category={categories[post.categoryId]} 
                    deletePostClicked={deletePostClicked} 
                    downloadFile={postActions.downloadFile}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App