import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.js';
import Register from './components/Register.js';
import LoginczyRegister from './components/LoginczyRegister.js';
import Home from './components/Home.js';
import Cookies from 'js-cookie';  
import MyAccount from './components/MyAccount.js';
import ChatGrid from './components/ChatGrid.js';
import Chat from './components/Chat.js';
import Ogloszenia from './components/Ogloszenia.js';
function App() {
  const [login, setLogin] = useState(Cookies.get('login'));

  useEffect(() => {
    const storedLogin = Cookies.get('login');
    setLogin(storedLogin);
  }, []); 

  return (
    <div>
      <Routes>
        <Route path="/" element={login ? <Navigate to = "/home"/> : <LoginczyRegister />} />
        <Route path="/login" element={login ? <Navigate to = "/home"/> : <Login />} />    
        <Route path="/register" element={login ? <Navigate to = "/home"/> : <Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/myaccount" element={<MyAccount />} />
        <Route path="/ogloszenia" element={< Ogloszenia />} />
        <Route path="/chat" element={<ChatGrid />} />
        <Route path="/chat/:chatid" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;
