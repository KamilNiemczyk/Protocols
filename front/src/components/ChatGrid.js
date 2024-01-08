import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';  
import Navbar from './Navbar';
import { useFormik } from "formik";
import { useNavigate } from 'react-router-dom';
import mqtt from 'precompiled-mqtt';

export default function ChatGrid() {
    const [login, setLogin] = useState(Cookies.get('login'));
    const [czaty, setCzaty] = useState([]);
    const [client, setClient] = useState(null);

    useEffect(() => {
      const storedLogin = Cookies.get('login');
      setLogin(storedLogin);
      fetch(`http://localhost:5000/getChats`)
      .then(response => response.json())
      .then(data => setCzaty(data))
    }, []); 

    useEffect(() => {
        const client = mqtt.connect('ws://localhost:8000/mqtt');
        client.on('connect', () => {
            client.subscribe('chat');
            console.log('connected to broker')
        });
        client.on('message', (topic, message) => {
            fetch(`http://localhost:5000/getChats`)
                .then(response => response.json())
                .then(data => setCzaty(data))
        });
        setClient(client);
        return () => {
            client.end();
        };
    }, []);

    const navigate = useNavigate();

    const toLower = (string) => {
        return string.toLowerCase().replace(/\s/g, '');
    }
    const handleClick = (chatid) => {
            navigate(`/chat/${chatid}`);
        }
    const validateChat = (values) => {
        const errors = {};
        if (!values.chat) {
            errors.chat = "Wymagane";
        } else if (values.chat.length <= 3) {
            errors.chat = "Za krótka nazwa";
        }
        return errors;
    };
    const formikChat = useFormik({
        initialValues: {
            chat: "",
        },
        validate: validateChat,
        onSubmit: (values) => {
            fetch(`http://localhost:5000/addChat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat: values.chat,
                }),
            })
            client.publish('chat', values.chat);
            formikChat.resetForm();
        }
    });
    const handleDeleteAllChats = () => {
        fetch(`http://localhost:5000/deleteAllChats`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        }).then(() => console.log('Usunięto wszystkie czaty'))
        .then(() => {
            client.publish('chat', "Usunieto chaty");
        })
    }
    return (
        <div className='bg-gray-300 min-h-screen'>
            {login ? (<div>
                <Navbar prop={login}/>
                <div className='m-10 space-y-7 '>
                    {czaty.map((chat, index) => (
                        <div key={index} onClick={() => handleClick(toLower(chat))}>
                            <div className='flex items-center justify-center h-20 w-full bg-gray-700 hover:bg-green-600 hover:text-black text-white font-bold py-2 px-4 rounded'>
                                {chat}
                            </div>
                        </div>    
                    ))}
                    <div className='flex items-center justify-center h-20 w-full bg-gray-700 text-white font-bold py-2 px-4 rounded'>
                        <form className='space-x-5 flex' onSubmit={formikChat.handleSubmit}>
                            <label htmlFor="chat" className='justify-center items-center flex'>Dodaj czat</label>
                            <input
                                id="chat"
                                name="chat"
                                type="text"
                                className='border-2 rounded text-black '
                                onChange={formikChat.handleChange}
                                value={formikChat.values.chat}
                            />
                            {formikChat.errors.chat ? <div className='flex justify-center items-center text-red-600'>{formikChat.errors.chat}</div> : null}
                            <button type="submit" className='hover:bg-green-400 text-white hover:text-black px-20 py-2 border border-white hover:border-black rounded transition duration-300 text-bold'>Dodaj</button>
                            <button type="button" onClick={handleDeleteAllChats} className='hover:bg-green-400 text-white hover:text-black px-20 py-2 border border-white hover:border-black rounded transition duration-300 text-bold'>Usuń wszystkie czaty</button>
                        </form>
                    </div>
                </div>
                </div> 
                ) : (
                <div className='flex items-center justify-center h-full' ><h1 className="text-4xl font-bold">Nie jesteś zalogowany</h1></div>)}
        </div>
    )
}
