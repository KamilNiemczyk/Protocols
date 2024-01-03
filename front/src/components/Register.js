import React from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";

export default function Register() {
    const navigate = useNavigate();
    const validate = (values) => {
        const errors = {};
        if (!values.login) {
            errors.login = "Jakiś login trzeba podać";
        } else if (values.login.length <= 3) {
            errors.login = "Musi być dłuższy niż 3 znaki";
        }
        if (!values.password) {
            errors.password = "Trzeba podać jakieś hasło";
        } else if (values.password.length <= 3) {
            errors.password = "Musi być dłuższe niż 3 znaki";
        }
        return errors;
    };

    const formik = useFormik({
        initialValues: {
            login: "",
            password: "",
        },
        validate,
        onSubmit: (values) => {
            fetch("http://localhost:5000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    login: values.login,
                    password: values.password,
                }),
            })
            .then((res) => {
                if (res.status === 201) {
                    alert("Zarejestrowano pomyślnie, teraz prosze się zalogować");
                    navigate("/login");
                } else {
                    alert("Błąd rejestracji");
                }
            })
            formik.resetForm();
        }, });
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Rejestracja</h2>
              <form onSubmit={formik.handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="login" className="block text-gray-700 text-sm font-bold mb-2">Login:</label>
                  <input
                    type="text"
                    id="login"
                    name="login"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.login}
                    className={`w-full border rounded-md p-2 ${formik.touched.login && formik.errors.login ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formik.touched.login && formik.errors.login && (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.login}</div>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Hasło:</label>
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
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                >
                  Zarejestruj się
                </button>
              </form>
            </div>
          );
}