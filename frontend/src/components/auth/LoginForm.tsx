import React from 'react';
import {useState} from 'react';
import {Alert} from "flowbite-react";
import {IoIosAlert} from "react-icons/io";

import {Button, Label, TextInput} from 'flowbite-react';
import {LoginFormPropsType} from "../../types";
import {jwtDecode} from "jwt-decode";

const LoginForm = ({setTab, setUser} : LoginFormPropsType) => {
    setTab(5);

    const [error, setError] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const loginRequest = (event : React.FormEvent) => {
        event.preventDefault();
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
            body: JSON.stringify({
                email: login,
                password: password
            })
        }).then(async (res) => {
            if (res.status === 200) {
                let response = await res.json();
                localStorage.setItem('token', response.token);
                setUser(jwtDecode(response.token));
                window.location.href = '/';
            } else {
                let error_message = await res.json();
                setError(error_message.error);
            }
        }).catch(() => {
            setError("Произошла ошибка при входе");
        })
    }

    return (
        <div>
            <Alert color="failure" className={error ? 'visible w-full md:max-w-md mx-auto' : 'hidden w-full md:max-w-md mx-auto '} icon={IoIosAlert}>
                {error}
            </Alert>
            <section>
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto mt-8 lg:py-0">
                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800
        dark:border-gray-700">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Войти в аккаунт
                            </h1>

                            <form className="space-y-4 md:space-y-6" onSubmit={loginRequest}>
                                <div>
                                    <div className="mb-2 block">
                                        <Label htmlFor="email" value="Введите email"/>
                                    </div>
                                    <TextInput type="email"
                                               onChange={(e) => setLogin(e.target.value)}
                                               value={login}
                                               id="email" placeholder="name@company.com" required/>
                                </div>
                                <div>
                                    <div className="mb-2 block">
                                        <Label htmlFor="password" value="Введите пароль"/>
                                    </div>
                                    <TextInput type="password"
                                               value={password}
                                               onChange={(e) => setPassword(e.target.value)}
                                               id="password" placeholder="••••••••" required/>
                                </div>
                                <Button type="submit">Войти</Button>
                                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                    Ещё нет аккаунта? <a href="/users/registration" className="font-medium text-primary-600 hover:underline
                        dark:text-primary-500">Регистрация</a>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LoginForm;