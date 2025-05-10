import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import SinglePost from '../SinglePost'
import { FolderPlus, FileQuestion, Loader2, Filter, X } from 'lucide-react'
import UploadModal from './NewPost'  // Importamos o componente de modal

function App() {  
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)  // Estado para controlar o modal

  let navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  // Função para buscar dados
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [postsResponse, categoriesResponse] = await Promise.all([
        axios.get("/api/posts"),
        axios.get("/api/categories")
      ])

      //Garantir que todas campos obrigatórios estejam preenchidos
      const processedPosts = postsResponse.data.map(post => ({
        ...post,
        fileType: post.fileType || 'application/octet-stream',
        originalFileName: post.originalFileName || 'Unnamed File',
        caption: post.caption || ''
      }))

      setPosts(processedPosts)
      setCategories(categoriesResponse.data)
    } catch (error) {
      console.error("Erro ao carregar:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
      
      // Cria uma âncora para iniciar o download do arquivo.
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

  // Abre o modal de upload
  const openUploadModal = () => {
    setIsUploadModalOpen(true)
  }

  // Fecha o modal de upload
  const closeUploadModal = () => {
    setIsUploadModalOpen(false)
  }

  // Atualiza a lista após um upload bem-sucedido
  const handleUploadSuccess = () => {
    closeUploadModal()
    fetchData()  // Recarrega a lista de documentos
  }

  const postActions = {
    editPostClicked,
    deletePostClicked,
    downloadFile
  }

  // Documentos Filtrados
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.originalFileName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = categoryFilter
      ? post.categoryId === Number(categoryFilter)
      : true;
    return matchesSearch && matchesCategory;
  });

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      {/* Modal de Upload */}
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={closeUploadModal} 
        onSuccess={handleUploadSuccess} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              Gerenciar documentos
            </h1>
            <p className="text-gray-600 mt-2">
              Organize e acesse seus arquivos facilmente
            </p>
          </div>
          <button
            onClick={openUploadModal}
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            <FolderPlus className="w-5 h-5 mr-2" />
            Novo documento
          </button>
        </div>

        {/* Search e filtro de categoria */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por nome do arquivo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-3 pl-10 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="relative min-w-[200px]">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-3 pl-10 border border-gray-300 rounded-lg w-full appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-10 text-center border border-gray-100">
            <div className="bg-blue-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <FileQuestion className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {categoryFilter 
                ? `Sem documentos na categoria ${categories.find(c => c.id === Number(categoryFilter))?.name}` 
                : 'Sem documentos registrados'}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {categoryFilter 
                ? 'Selecione outra categoria ou adicione novos documentos' 
                : 'Comece adicionando seu primeiro arquivo ao sistema.'}
            </p>
            <button
              onClick={openUploadModal}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              <FolderPlus className="w-5 h-5 mr-2" />
              Adicionar novo arquivo
            </button>
          </div>
        ) : (
          <div>
            {categoryFilter && (
              <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm">
                <p className="text-blue-800 font-medium flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Mostrando arquivos na categoria: <span className="font-bold ml-1">{categories.find(c => c.id === Number(categoryFilter))?.name}</span>
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <div 
                  key={`post-${post.id}`}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden hover:border-blue-200"
                >
                  <div className="p-6">
                    <SinglePost 
                      post={post} 
                      category={categories.find(c => c.id === post.categoryId)?.name} 
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