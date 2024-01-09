import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';  
import Navbar from './Navbar';
import { useFormik } from "formik";

export default function Home() {
    const [login, setLogin] = useState(Cookies.get('login'));
    const [password, setPassword] = useState("");
    const [admin, setAdmin] = useState(Cookies.get('admin'));
    useEffect(() => {
        const storedAdmin = Cookies.get('admin');
        setAdmin(storedAdmin);
    }, [admin]);

    useEffect(() => {
        const storedLogin = Cookies.get('login');
        setLogin(storedLogin);
      }, [login]); 
      
    const validatePassword = (values) => {
        const errors = {};
        if (!values.password) {
            errors.password = "Trzeba podać jakieś hasło";
        } else if (values.password.length <= 3) {
            errors.password = "Musi być dłuższe niż 3 znaki";
        }
        return errors;
    };
    const validateLogin = (values) => {
        const errors = {};
        if (!values.login) {
            errors.login = "Jakiś login trzeba podać";
        } else if (values.login.length <= 3) {
            errors.login = "Musi być dłuższy niż 3 znaki";
        }
        return errors;
    };
    const formikLogin = useFormik({
        initialValues: {
            login: "",
        },
        validate: validateLogin,
        onSubmit: (values) => {
            fetch(`http://localhost:5000/editLogin`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    login: login,
                    newLogin: values.login,
                }),
            })
            .then((res) => {
                if (res.status === 200) {
                    alert("Zmieniono login");
                    Cookies.set("login", values.login);
                    setLogin(values.login);
                }
            }
            )
            formikLogin.resetForm();
        }
    });

    const formik = useFormik({
        initialValues: {
            password: "",
        },
        validate : validatePassword,
        onSubmit: (values) => {
            fetch(`http://localhost:5000/editPassword`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    login: login,
                    password: values.password,
                }),
            })
            .then((res) => {
                if (res.status === 200) {
                    alert("Zmieniono hasło");
                    setPassword("Ustawiono nowe hasło");
                } else {
                    alert("Błąd zmiany hasła");
                }
            })
            formik.resetForm();
        }
    });

    const getPassword = () => {
        fetch(`http://localhost:5000/getPassword/${login}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((res) => {
            if (res.status === 200) {
                return res.json(); 
            } else {
                alert("Błąd pobierania hasła");
            }
        }).then((data) => {
            if (data && data.password) {
                setPassword(data.password);
            } else {
                alert("Błąd pobierania hasła");
            }
        })
    };

    const hidePassword = () => {
        setPassword("");
    }
    const changeRole = () => {
        if (admin === "true") {
            Cookies.set("admin", "false");
            setAdmin("false");
        } else {
            Cookies.set("admin", "true");
            setAdmin("true");
        }
    }



    return (
        <div className='bg-gray-300'>
            {login ? (
            <div className='h-screen'>
                <Navbar  prop={login} />
                {admin === "true" ? (<button onClick={changeRole} className='flex justify-center items-center bg-gray-700 m-auto border rounded-full text-white py-4 px-8 my-7'>Kliknij by zabrac sobie prawa adminstratora</button>) : 
                (<button onClick={changeRole} className='flex justify-center items-center bg-gray-700 m-auto border rounded-full text-white py-4 px-8 my-7'>Kliknij by uzyskać prawa administratora</button>)
                }
                <div className='flex item-center justify-center m-[2%]'>
                    <div className='bg-gray-700 flex-grow border rounded-lg py-20 mb-10 px-20 h-full space-y-5'>
                        <div className='justify-center flex items-center space-x-5'>
                            <button onClick={getPassword} className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full'>Przypomnij hasło zahashowane</button>
                            {password.length > 0 ? (<p className='text-white'>{password}</p>) : (<p className='text-white'>Hasło schowane</p>)}
                            <button onClick={hidePassword} className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full'>Schowaj hasło</button>
                        </div>
                        <div className='justify-center flex items-center'>
                            <form className="flex space-x-5" onSubmit={formik.handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="password" className=" text-white text-sm font-bold">Nowe hasło:</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.password}
                                        className={`w-full border rounded-md p-2 ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {formik.touched.password && formik.errors.password && (
                                        <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full'
                                >
                                    Zmień hasło
                                </button>
                            </form>
                        </div>
                        <div className='justify-center flex items-center'>
                            <form className="flex space-x-5" onSubmit={formikLogin.handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="login" className=" text-white text-sm font-bold">Nowy login:</label>
                                    <input
                                        type="text"
                                        id="login"
                                        name="login"
                                        onChange={formikLogin.handleChange}
                                        onBlur={formikLogin.handleBlur}
                                        value={formikLogin.values.login}
                                        className={`w-full border rounded-md p-2 ${formikLogin.touched.login && formikLogin.errors.login ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {formikLogin.touched.login && formikLogin.errors.login && (
                                        <div className="text-red-500 text-sm mt-1">{formikLogin.errors.login}</div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full'
                                >
                                    Zmień login
                                </button>
                            </form>
                            </div>
                    </div>
                </div>
            </div> 
                ) : (
                <div className='flex items-center justify-center h-full' ><h1 className="text-4xl font-bold">Nie jesteś zalogowany</h1></div>)}
        </div>
    )
}