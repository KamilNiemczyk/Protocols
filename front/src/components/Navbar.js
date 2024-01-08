import React from "react";
import { Link } from "react-router-dom";
export default function Navbar(prop) {
    return (
        <div className="bg-gray-700 mb-30">
            <div className="flex justify-between">
                <div className="text-3xl text-white font-bold justify-start ml-5 my-5  hover:text-green-400">Witaj użytkowniku: {prop.prop}</div>
                <div className='ml-auto text-white mt-auto mb-auto'> <Link to="/home" className="hover:bg-green-400 text-white hover:text-black px-20 py-2 border border-white hover:border-black rounded transition duration-300 text-bold">STRONA GŁÓWNA</Link></div>
                <div className='ml-auto text-white mt-auto mb-auto'> <Link to="/" className="hover:bg-green-400 text-white hover:text-black px-20 py-2 border border-white hover:border-black rounded transition duration-300">Posty</Link></div>
                <div className='ml-auto text-white mt-auto mb-auto'> <Link to="/chat" className="hover:bg-green-400 text-white hover:text-black px-20 py-2 border border-white hover:border-black rounded transition duration-300">Czat</Link></div>
                <div className='ml-auto mr-20 text-white mt-auto mb-auto'> <Link to="/myaccount" className="hover:bg-green-400 text-white hover:text-black px-20 py-2 border border-white hover:border-black rounded transition duration-300">Moje konto</Link></div>
            </div>
        </div>
    );
};
