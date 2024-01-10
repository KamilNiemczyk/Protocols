import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';  
import Navbar from './Navbar';
import {useFormik} from 'formik';
export default function Home() {
    const [login, setLogin] = useState(Cookies.get('login'));
    const [admin, setAdmin] = useState(Cookies.get('admin'));
    const [notes, setNotes] = useState([]);

    useEffect(() => {
      const storedLogin = Cookies.get('login');
      setLogin(storedLogin);
    }, [login]); 
    useEffect(() => {
        const storedAdmin = Cookies.get('admin');
        setAdmin(storedAdmin);
      }, [admin]);

    useEffect(() => {
        fetch("http://localhost:5000/getNotes", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => res.json())
        .then((data) => {
            setNotes(data);
        });
    }
    , []);
    const validateNote = (values) => {
        const errors = {};
        if (!values.note) {
            errors.note = "Jakiś login trzeba podać";
        } else if (values.note.length <= 3) {
            errors.note = "Musi być dłuższy niż 3 znaki";
        }
        return errors;
    };

    const handleDeletaAll = () => {
        fetch("http://localhost:5000/deleteAllNotes", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then((res) => {
            if (res.status === 200) {
                alert("Usunięto pomyślnie");
                window.location.reload();
            } else {
                alert("Błąd usuwania");
            }
        })
    }

    const formik = useFormik({
        initialValues: {
            note: "",
        },
        validateNote,
        onSubmit: (values) => {
            fetch("http://localhost:5000/addNote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    note: values.note,
                    login: login,
                }),
            })
            .then((res) => {
                if (res.status === 201) {
                    alert("Dodano pomyślnie");
                    window.location.reload();
                } else {
                    alert("Błąd dodawania");
                }
            })
            formik.resetForm();
        }, });
    

        
    return (
        <div className='bg-gray-300 min-h-screen'>
            {login ? (<div className='max-h-screen'>
                <Navbar prop={login}/>
                <div className='flex item-center flex-col justify-center'>
                    <div className='flex flex-col items-center justify-center mt-[10%] space-y-12 bg-gray-700 px-8 py-12 border rounded-3xl border-white text-white hover:bg-green-600 hover:text-black duration-1000'>
                        <h1 className='text-5xl'>Jest to strona domowa</h1>
                        <p className='text-5xl'>Jak chcesz wstawić jakieś ogłoszenie wejdź w zakładke "Ogłoszenia"</p>
                        <p className='text-5xl'>Jak chcesz z kimś porozmawiać wejdź w "Czat"</p>
                        <p className='text-5xl'>Żeby uzyskać informacje na temat konta wejdź w "Moje konto"</p>
                    </div>
                    <div className='flex flex-col items-center justify-center mt-[3%] space-y-12 bg-gray-700 px-8 py-12 border rounded-3xl border-white text-white hover:bg-green-600 hover:text-black duration-1000 mb-20'>
                        <h1 className='text-5xl'>Czat globalny</h1>
                        <div className='flex flex-col items-center justify-center space-y-5'>
                            {notes.map((note) => (
                                <div className='flex items-center justify-center bg-gray-200 rounded-full text-black px-2 py-2 min-w-screen'>
                                    <p className='text-xl'>{note.login} : {note.note}</p>
                                </div>
                            ))}
                        </div>
                        {admin ? (
                            <button onClick={handleDeletaAll} className="w-full px-3 py-4 text-white bg-red-500 rounded-md hover:bg-red-600 focus:bg-red-700 focus:outline-none">Usuń wszystkie wiadomości</button>
                        ) : null}
                        <form onSubmit={formik.handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="note" className="block text-gray-700 text-sm font-bold mb-2">Tu wpisz wiadomość:</label>
                                <input
                                    type="text"
                                    id="note"
                                    name="note"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.note}
                                    className={`w-full border rounded-md p-2 ${formik.touched.note && formik.errors.note ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {formik.touched.note && formik.errors.note && (
                                    <div className="text-red-500 text-sm mt-1">{formik.errors.note}</div>
                                )}
                            </div>
                            <button type="submit" className="w-full px-3 py-4 text-white bg-green-500 rounded-md hover:bg-green-600 focus:bg-green-700 focus:outline-none">Dodaj wiadomość</button>
                        </form>
                        </div>
                </div>
                </div> 
                ) : (
                <div className='flex items-center justify-center h-full' ><h1 className="text-4xl font-bold">Nie jesteś zalogowany</h1></div>)}
        </div>
    )
}