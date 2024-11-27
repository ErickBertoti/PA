import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import SinglePost from '../SinglePost'
import { FolderPlus, FileQuestion, Loader2, Filter, X } from 'lucide-react'

function App() {  
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categoryList, setCategoryList] = useState([])
  let navigate = useNavigate()

  useEffect(() => {
    async function getPostsAndCategories() {
      try {
        setIsLoading(true)
        const [postsResponse, categoriesResponse] = await Promise.all([
          axios.get("/api/posts"),
          axios.get("/api/categories")
        ])

        // Modify posts to ensure all required fields are present
        const processedPosts = postsResponse.data.map(post => ({
          ...post,
          fileType: post.fileType || 'application/octet-stream',
          originalFileName: post.originalFileName || 'Unnamed File',
          caption: post.caption || ''
        }))

        setPosts(processedPosts)
        const categoriesMap = categoriesResponse.data.reduce((acc, category) => {
          acc[category.id] = category.name
          return acc
        }, {})
        setCategories(categoriesMap)
        setCategoryList(categoriesResponse.data)
      } catch (error) {
        console.error("Erro ao carregar:", error)
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
      alert("Não foi possível deletar. verifique sua autenticação.")
    }
  }
  
  const downloadFile = async ({id}) => {
    try {
      const response = await axios.get(`/api/posts/${id}/download`)
      
      // Create an anchor element to trigger download
      const a = document.createElement('a')
      a.href = response.data.url
      a.download = response.data.originalFileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error(error)
      alert("Erro ao baixar arquivo")
    }
  }

  const postActions = {
    editPostClicked,
    deletePostClicked,
    downloadFile
  }

  // Filtro por categoria
  const filteredPosts = selectedCategory 
    ? posts.filter(post => post.categoryId === selectedCategory)
    : posts

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
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar documentos</h1>
          <button
            onClick={() => navigate('/newPost')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <FolderPlus className="w-5 h-5 mr-2" />
            Novo documento
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex items-center space-x-4">
          <div className="relative">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="appearance-none w-full pl-10 pr-8 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Todos documentos</option>
              {categoryList.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <FileQuestion className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {selectedCategory 
                ? `Sem documentos na categoria ${categories[selectedCategory]}` 
                : 'Sem documentos registrados'}
            </h2>
            <p className="text-gray-600 mb-6">
              {selectedCategory 
                ? 'Olhe em outra categoria' 
                : 'Comece adicionando o primeiro arquivo.'}
            </p>
            <button
              onClick={() => navigate('/newPost')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <FolderPlus className="w-5 h-5 mr-2" />
              Adicionar novo arquivo
            </button>
          </div>
        ) : (
          <div>
            {selectedCategory && (
              <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-blue-800 font-medium">
                  Mostrando arquivos na categoria: {categories[selectedCategory]}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <div 
                  key={`post-${post.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <SinglePost 
                      post={post} 
                      category={categories[post.categoryId]} 
                      deletePostClicked={deletePostClicked} 
                      downloadFile={downloadFile}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App