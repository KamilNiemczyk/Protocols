import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';  
import Navbar from './Navbar';
export default function Home() {
    const [login, setLogin] = useState(Cookies.get('login'));

    useEffect(() => {
      const storedLogin = Cookies.get('login');
      setLogin(storedLogin);
    }, [login]); 

    return (
        <div className='bg-gray-300 min-h-screen'>
            {login ? (<div>
                <Navbar prop={login}/>
                <div className='flex item-center justify-center'>
                    Tu jest wielki chat
                </div>
                </div> 
                ) : (
                <div className='flex items-center justify-center h-full' ><h1 className="text-4xl font-bold">Nie jesteś zalogowany</h1></div>)}
        </div>
    )
}