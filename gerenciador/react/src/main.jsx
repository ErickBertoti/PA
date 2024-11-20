import React from 'react'
import ReactDOM from 'react-dom/client'

import Home from './components/pages/Home'
import NewPost from './components/pages/NewPost'
import Login from './components/pages/Login'
import Register from './components/pages/Register'

import Layout from './Layout'
import ProtectedRoute from './components/ProtectedRoute'

import './index.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="newPost"
            element={
              <ProtectedRoute>
                <NewPost />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
