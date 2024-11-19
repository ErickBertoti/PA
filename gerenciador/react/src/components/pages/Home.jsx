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

  const postActions = {
    editPostClicked,
    deletePostClicked
  }

  return (
    <div className="App">

      <div className="flex flex-col space-y-100 items-center divide-y">
        {posts.map(post => (
          <div key={`post-${post.id}`} className="px-5 py-14">

            <SinglePost className="relative" post={post} category={categories[post.categoryId]} deletePostClicked={deletePostClicked}></SinglePost>
            
          </div>
        ))}
      </div>

    </div>
  )
}

export default App