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
  const deletePostClicked = async ({id}) => {
    console.log(`deletePostClicked = (${id})`)
    await axios.delete("/api/posts/" + id)
    setPosts(posts.filter(post => post.id !== id))
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

  return (
    <div className="App h-screen bg-gray-100">

      <div className="flex flex-wrap justify-center space-y-4 items-center divide-y divide-gray-200 py-10">
        {posts.map(post => (
          <div key={`post-${post.id}`} className="px-5 py-5 bg-white rounded-md shadow-md w-300 mx-4 my-4">

            <SinglePost className="relative" post={post} category={categories[post.categoryId]} deletePostClicked={deletePostClicked} downloadFile={postActions.downloadFile}></SinglePost>
            
          </div>
        ))}
      </div>

    </div>
  )
}

export default App