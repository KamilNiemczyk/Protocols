import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';  
import Navbar from './Navbar';
import { useFormik } from "formik";
import mqtt from 'precompiled-mqtt';

export default function Ogloszenia() {
    const [login, setLogin] = useState(Cookies.get('login'));
    const [ogloszenia, setOgloszenia] = useState([]);
    const [client, setClient] = useState(null);
    const [admin, setAdmin] = useState(Cookies.get('admin'));

    useEffect(() => {
        const storedAdmin = Cookies.get('admin');
        setAdmin(storedAdmin);
        }, [admin]);


    useEffect(() => {
      const storedLogin = Cookies.get('login');
      setLogin(storedLogin);
    }, [login]); 

    useEffect(() => {
        fetch('http://localhost:5000/getOgloszenia')
        .then(response => response.json())
        .then(data => setOgloszenia(data))
    } ,[])

    const validateOgloszenie = (values) => {
        const errors = {};
        if (!values.tytul) {
            errors.tytul = "Trzeba podać tytuł";
        } else if (values.tytul.length <= 3) {
            errors.tytul = "Musi być dłuższy niż 3 znaki";
        }
        if (!values.tresc) {
            errors.tresc = "Trzeba podać treść";
        } else if (values.tresc.length <= 3) {
            errors.tresc = "Musi być dłuższy niż 3 znaki";
        }
        return errors;
    };
    useEffect(() => {
        const client = mqtt.connect('ws://localhost:8000/mqtt');
        client.on('connect', () => {
            client.subscribe('ogloszenia');
            console.log('connected to broker')
        });
        client.on('message', (topic, message) => {
            fetch(`http://localhost:5000/getOgloszenia`)
                .then(response => response.json())
                .then(data => setOgloszenia(data))
        });
        setClient(client);
        return () => {
            client.end();
        };
    }, []);

    const handleDeleteOgloszenie = (id) => {
        fetch(`http://localhost:5000/deleteOgloszenie`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: id,
            }),
        })
        .then((res) => {
            if (res.status === 200) {
                client.publish('ogloszenia', 'usun ogloszenie');
            }
        }
        );
    }

    const formikOgloszenie = useFormik({
        initialValues: {
            tytul: "",
            tresc: "",
        },
        validate: validateOgloszenie,
        onSubmit: (values) => {
            fetch(`http://localhost:5000/addOgloszenie`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tytul: values.tytul,
                    tresc: values.tresc,
                    login: login,
                }),
            })
            .then((res) => {
                if (res.status === 201) {
                    formikOgloszenie.resetForm();
                    client.publish('ogloszenia', 'nowe ogloszenie');
                }
            }
            );
        },
    });
    const validateEditOgloszenie = (values) => {
        const errors = {};
        if (!values.tytul) {
            errors.tytul = "Trzeba podać tytuł";
        } else if (values.tytul.length <= 3) {
            errors.tytul = "Musi być dłuższy niż 3 znaki";
        }
    };
    const EditOgloszenieTitle = ({ id }) => {
        const formik = useFormik({
            initialValues: {
                tytul: "",
            },
            validate: validateEditOgloszenie,
            onSubmit: (values) => {
                fetch(`http://localhost:5000/editOgloszenieTitle`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: id,
                        tytul: values.tytul,
                    }),
                })
                .then((res) => {
                    if (res.status === 200) {
                        formik.resetForm();
                        client.publish('ogloszenia', 'edytuj tytul ogloszenia');
                    }
                }
                );
            }
        });
        return (
            <div>
                <form onSubmit={formik.handleSubmit}>
                    <div className='flex flex-col'>
                        <label className='text-xl font-bold'>Edytuj tytuł</label>
                        <input
                            type="text"
                            name="tytul"
                            onChange={formik.handleChange}
                            value={formik.values.tytul}
                            className='border-2 border-gray-300 p-2 rounded-md'
                        />
                        {formik.errors.tytul ? (
                            <div className='text-red-500'>{formik.errors.tytul}</div>
                        ) : null}
                    </div>
                    <button type="submit" className='hover:bg-green-400 bg-gray-700 text-white hover:text-black px-20 py-2 border border-white hover:border-black rounded transition duration-300 text-bold'>Edytuj tytuł</button>
                </form>
            </div>
        );
    }


    const validateKomentarz = (values) => {
        const errors = {};
        if (!values.komentarz) {
            errors.komentarz = "Trzeba podać komentarz";
        } else if (values.komentarz.length <= 3) {
            errors.komentarz = "Musi być dłuższy niż 3 znaki";
        }
        return errors;
    };
    const handleDeleteAllOgloszenia = () => {
        fetch(`http://localhost:5000/deleteAllOgloszenia`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => {
            if (res.status === 200) {
                client.publish('ogloszenia', 'usun wszystkie ogloszenia');
            }
        }
        );
    }

    const EditKomentarz = ({ id }) => {
        const formik = useFormik({
            initialValues: {
                komentarz: "",
            },
            validate: validateKomentarz,
            onSubmit: (values) => {
                fetch(`http://localhost:5000/addKomentarz`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: id,
                        komentarz: values.komentarz,
                        login: login,
                    }),
                })
                .then((res) => {
                    if (res.status === 200) {
                        formik.resetForm();
                        client.publish('ogloszenia', 'nowy komentarz');
                    }
                }
                );
            }
        });
        return (
            <div>
                <form onSubmit={formik.handleSubmit}>
                    <div className='flex flex-col'>
                        <label className='text-xl font-bold'>Wstaw Komentarz</label>
                        <textarea
                            type="text"
                            name="komentarz"
                            onChange={formik.handleChange}
                            value={formik.values.komentarz}
                            className='border-2 border-gray-300 p-2 rounded-md'
                        />
                        {formik.errors.komentarz ? (
                            <div className='text-red-500'>{formik.errors.komentarz}</div>
                        ) : null}
                    </div>
                    <button type="submit" className='hover:bg-green-400 bg-gray-700 text-white hover:text-black px-20 py-2 border border-white hover:border-black rounded transition duration-300 text-bold'>Wstaw komentarz</button>
                </form>
            </div>
        );
    }
    return (
        <div className='bg-gray-300 min-h-screen'>
            {login ? (<div>
                <Navbar prop={login}/>
                <div className='py-4 bg-gray-700 my-5 rounded mx-[15%]'> 
                    <h1 className='flex justify-center items-center text-2xl uppercase font-bold text-white'>Tutaj znajdują się ogłoszenia</h1>
                </div>
                {admin === 'true' ? (
                    <div className='flex justify-center items-center'>
                        <button onClick={handleDeleteAllOgloszenia} className='hover:bg-green-400 bg-gray-700 text-white hover:text-black px-20 py-2 border border-white hover:border-black rounded transition duration-300 text-bold'>Usuń wszystkie ogłoszenia</button>
                    </div>
                ) : null}
                <div className='flex justify-center items-center my-4'> 
                    <form onSubmit={formikOgloszenie.handleSubmit}>
                        <div className='flex flex-col space-y-2'>
                            <div className='flex flex-col'>
                                <label className='text-xl font-bold'>Tytuł ogłoszenia</label>
                                <input
                                    type="text"
                                    name="tytul"
                                    onChange={formikOgloszenie.handleChange}
                                    value={formikOgloszenie.values.tytul}
                                    className='border-2 border-gray-300 p-2 rounded-md'
                                />
                                {formikOgloszenie.errors.tytul ? (
                                    <div className='text-red-500'>{formikOgloszenie.errors.tytul}</div>
                                ) : null}
                            </div>
                            <div className='flex flex-col'>
                                <label className='text-xl font-bold'>Treść ogłoszenia</label>
                                <textarea
                                    type="text"
                                    name="tresc"
                                    onChange={formikOgloszenie.handleChange}
                                    value={formikOgloszenie.values.tresc}
                                    className='border-2 border-gray-300 p-2 rounded-md'
                                />
                                {formikOgloszenie.errors.tresc ? (
                                    <div className='text-red-500'>{formikOgloszenie.errors.tresc}</div>
                                ) : null}
                            </div>
                            <button type="submit" className='hover:bg-green-400 bg-gray-700 text-white hover:text-black px-20 py-2 border border-white hover:border-black rounded transition duration-300 text-bold'>Dodaj ogłoszenie</button>
                        </div>
                    </form>
                    </div>
                    <div className='m-10 space-y-8 flex flex-col '>
                        {ogloszenia.map((ogloszenie, index) => (
                            <div key={index}>
                                <div className='flex flex-col items-center justify-center bg-gray-700 hover:bg-green-600 text-gray-700 font-bold py-2 px-4 rounded'>
                                    {/* <h1 className='text-xl'>{ogloszenie._id}</h1> */}
                                    <div className='my-auto bg-gray-400 w-full justify-center items-center rounded py-1 flex flex-col'>
                                        <h1 className='text-3xl'>Tytuł ogłoszenia: {ogloszenie.tytul}</h1>
                                        <p className='text-xl'>{ogloszenie.tresc}</p>
                                        <h1>Autor: {ogloszenie.login}</h1>
                                        {admin === 'true' ? (
                                            <button onClick={() => handleDeleteOgloszenie(ogloszenie._id)} className='hover:bg-green-400 bg-gray-700 text-white hover:text-black px-20 py-2 my-4 border border-white hover:border-black rounded transition duration-300 text-bold'>Usuń ogłoszenie</button>
                                        ) : null}
                                        {admin === 'true' ? (
                                            <div className='flex justify-center items-center'>
                                                <EditOgloszenieTitle id={ogloszenie._id}/>
                                            </div>
                                        ) : null    }
                                    </div>
                                    <div className='my-4 bg-gray-400 w-full flex flex-col items-center justify-center'>
                                        <p className='text-gray-700 text-3xl my-2'> Komentarze </p>
                                        <div className='mb-3'>
                                            <EditKomentarz id={ogloszenie._id}/>
                                        </div>
                                        <div className='flex flex-col my-4 space-y-3 w-full'> 
                                            {ogloszenie.komentarze.map((komentarz, index) => (
                                                <div key={index} className='flex flex-col items-center justify-center bg-gray-700 hover:bg-green-600 text-white font-bold py-2 mx-10 px-4 rounded'>
                                                    <h1 className='text-xl'>Autor: {komentarz.login}</h1>
                                                    <h1>Komentarz: {komentarz.komentarz}</h1>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>    
                        ))}
                        </div>
                </div> 
                ) : (
                <div className='flex items-center justify-center h-full' ><h1 className="text-4xl font-bold">Nie jesteś zalogowany</h1></div>)}
        </div>
    )
}