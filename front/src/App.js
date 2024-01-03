import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login.js';
import Register from './components/Register.js';
import LoginczyRegister from './components/LoginczyRegister.js';
import Home from './components/Home.js';
function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginczyRegister />} />
        <Route path="/login" element={<Login />} />    
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
