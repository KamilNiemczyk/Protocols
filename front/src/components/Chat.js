import React from 'react';
import { useParams } from 'react-router-dom';

const Chat = () => {
  const { chatid } = useParams();

  return (
    <div>
      <h1>Taka jest nazwa tego chatu: {chatid}</h1>
    </div>
  );
};

export default Chat;