import React from "react";
import { Link } from "react-router-dom";


export default function LoginczyRegister() {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-5xl mb-6 ">Wybierz opcje</h2>
        <div class="inline-flex">
            <Link to="/login">
                <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-5 px-5 rounded-l">
                Zaloguj się
                </button>
            </Link>
            <Link to="/register">
                <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-5 px-5 rounded-r">
                Zarejestruj się
                </button>
            </Link>
        </div>
      </div>
    );
  }