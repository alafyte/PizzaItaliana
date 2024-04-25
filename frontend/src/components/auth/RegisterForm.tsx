import React, {useState} from 'react';
import {SetTabPropsType} from "../../types";
import {IoIosAlert} from "react-icons/io";
import {Alert, Button, Label, TextInput, Datepicker} from "flowbite-react";
import {formatDate} from "../../utils";

const RegisterForm = ({setTab}: SetTabPropsType) => {

    setTab(6);

    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");

    const registerRequest = (event: React.FormEvent) => {
        event.preventDefault();

        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/auth/registration`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                full_name: fullName,
                email: email,
                phone_number: phoneNumber,
                date_of_birth: dateOfBirth,
                password: password,
                repeat_password: repeatPassword
            })
        }).then(async (res) => {
            if (res.status === 200) {
                window.location.href = '/users/login';
            } else {
                let error_message = await res.json();
                let error_text = "";
                for (let message of error_message.error) {
                    error_text += `${message.msg}\n`;
                }
                setError(error_text);
            }
        }).catch(() => {
            setError("Произошла ошибка при регистрации");
        })
    }


    return (
        <div>
            <Alert color="failure"
                   className={error ? 'visible w-full md:max-w-md mx-auto' : 'hidden w-full md:max-w-md mx-auto '}
                   icon={IoIosAlert}>
                {error.split("\n").map(error => <p>{error}</p>)}
            </Alert>
            <section>
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto mt-8 lg:py-0">
                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md md:max-w-2xl xl:p-0 dark:bg-gray-800
        dark:border-gray-700">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Создать аккаунт
                            </h1>
                            <form className="space-y-4 md:space-y-6" onSubmit={registerRequest}>
                                <div className="grid grid-flow-col gap-7">
                                    <div>
                                        <div className="mb-2 block">
                                            <Label htmlFor="full_name" value="Имя"/>
                                        </div>
                                        <TextInput type="text"
                                                   onChange={(e) => setFullName(e.target.value)}
                                                   value={fullName}
                                                   id="full_name" required/>
                                    </div>
                                    <div>
                                        <div className="mb-2 block">
                                            <Label htmlFor="email" value="Введите email"/>
                                        </div>
                                        <TextInput type="email"
                                                   onChange={(e) => setEmail(e.target.value)}
                                                   value={email}
                                                   id="email" placeholder="name@company.com" required/>
                                    </div>
                                </div>
                                <div className="grid grid-flow-col gap-7">
                                    <div>
                                        <div className="mb-2 block">
                                            <Label htmlFor="phone_number" value="Номер телефона"/>
                                        </div>
                                        <TextInput type="tel" pattern="^\+375\(\d{2}\)\d{3}-\d{2}-\d{2}$"
                                                   onChange={(e) => setPhoneNumber(e.target.value)}
                                                   value={phoneNumber} placeholder="+375(XX)XXX-XX-XX"
                                                   id="phone_number" required/>
                                    </div>
                                    <div>
                                        <div className="mb-2 block">
                                            <Label htmlFor="phone_number" value="Дата рождения"/>
                                        </div>
                                        <Datepicker
                                            onSelectedDateChanged={(date) => setDateOfBirth(formatDate(date))}
                                            language="ru-ru" labelTodayButton="Сегодня"
                                            labelClearButton="Очистить"
                                            weekStart={1} maxDate={new Date()} datepicker-format="dd-mm-yyyy"/>
                                    </div>
                                </div>
                                <div className="grid grid-flow-col gap-7">
                                    <div>
                                        <div className="mb-2 block">
                                            <Label htmlFor="password" value="Пароль"/>
                                        </div>
                                        <TextInput type="password"
                                                   value={password}
                                                   onChange={(e) => setPassword(e.target.value)}
                                                   id="password" placeholder="••••••••" required/>
                                    </div>
                                    <div>
                                        <div className="mb-2 block">
                                            <Label htmlFor="repeat_password" value="Повторите пароль"/>
                                        </div>
                                        <TextInput type="password"
                                                   value={repeatPassword}
                                                   onChange={(e) => setRepeatPassword(e.target.value)}
                                                   id="repeat_password" placeholder="••••••••" required/>
                                    </div>
                                </div>
                                <Button className="mx-auto" type="submit">Зарегистрироваться</Button>
                                <p className="text-sm text-center font-light text-gray-500 dark:text-gray-400">
                                    Уже есть аккаунт? <a href="/users/login" className="font-medium text-primary-600 hover:underline
                        dark:text-primary-500">Войти</a>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default RegisterForm;