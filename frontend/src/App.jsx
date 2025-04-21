import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';

// 页面组件
import Home from './pages/Home';
import About from './pages/About';

// 通用组件  
import Header from './components/Header';
import Footer from './components/Footer';

import './App.css';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // 测试与后端的连接
    axios.get('/api/hello')
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setMessage('无法连接到后端服务');
      });
  }, []);

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {message && <div className="api-message">{message}</div>}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App; 