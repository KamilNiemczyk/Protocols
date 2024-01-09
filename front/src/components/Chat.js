import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Cookies from 'js-cookie';  
import mqtt from 'precompiled-mqtt';
import { useFormik } from "formik";
const Chat = () => {
  const { chatid } = useParams();
  const [login, setLogin] = useState(Cookies.get('login'));
  const [messages, setMessages] = useState([]);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const storedLogin = Cookies.get('login');
    setLogin(storedLogin);
  }, []);
  useEffect(() => {
    const client = mqtt.connect('ws://localhost:8000/mqtt');
    client.on('connect', () => {
      client.subscribe(chatid);
      client.publish(chatid, `${login} dołączył do czatu`);
    });
    client.on('message', (topic, message) => {
      setMessages((messages) => [...messages, message.toString()]);
    });
    setClient(client);
    return () => {
      client.publish(chatid, `${login} opuścił czat`);
      client.end();
    };
  }, [chatid, login]);

  const validateMessage = (values) => {
    const errors = {};
    if (!values.message) {
      errors.message = "Wymagane";
    } else if (values.message.length <= 2) {
      errors.message = "Za krótka wiadomość";
    }
    return errors;
  };
  const formikMessage = useFormik({
    initialValues: {
      message: "",
    },
    validate: validateMessage,
    onSubmit: (values) => {
      client.publish(chatid, `${login}: ${values.message}`);
      formikMessage.resetForm();
    },
  });

  return (
    <div className='bg-gray-300 min-h-screen'>
      {login ? (<div> 
        <Navbar prop={login} /> 
        <div className='py-4 bg-gray-700 my-5 rounded mx-[15%]'> 
          <h1 className='flex justify-center items-center text-2xl uppercase font-bold text-white'>Taka jest nazwa tego chatu: {chatid}</h1>
        </div>
        <div className='py-4 bg-gray-700 mt-5 rounded mx-[15%]'>
          <div className='flex justify-center items-center text-2xl uppercase font-bold text-white mx-3'>Tryb znikających wiadomości (wiadomosci nie bedzie sie dało zobaczyc po wyjsciu z zakładki)</div>
          <div className='flex items-center justify-center mx-10 my-5 h-20 bg-gray-300  font-bold py-2 px-4 rounded'>
            <form className="flex justify-center items-center space-x-3"onSubmit={formikMessage.handleSubmit}>
              <label htmlFor="message" className='text-2xl uppercase font-bold text-gray-700'>Wiadomość</label>
              <input
                id="message"
                name="message"
                type="text"
                onChange={formikMessage.handleChange}
                value={formikMessage.values.message}
                className='mx-5' 
              />
              {formikMessage.errors.message ? <div className='text-red-700'>{formikMessage.errors.message}</div> : null}
              <button type="submit" className='bg-gray-700 text-white font-bold py-2 px-4 rounded'>Wyślij</button>
            </form>
          </div>
          <div className='flex bg-gray-300 mx-10 my-5 text-2xl text-gray-700 uppercase font-bold rounded'>
            <ul className='my-4 mx-4'>
              {messages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>) : 
      (<div className='flex items-center justify-center h-full' ><h1 className="text-4xl font-bold">Nie jesteś zalogowany</h1></div>) }
    </div>
  );
};

export default Chat;