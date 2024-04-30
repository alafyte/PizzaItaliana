import React, {useState} from 'react';
import {IoIosAlert} from "react-icons/io";
import {Alert, Button, Datepicker, Label, TextInput} from "flowbite-react";
import {formatDate, getBearer} from "../../utils";

const AdminAdd = () => {
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");

    const registerAdmin = (event: React.FormEvent) => {
        event.preventDefault();

        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
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
                window.location.href = '/admin/head/admins';
            } else if (res.status === 403) {
                localStorage.removeItem('token');
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
            setError("Произошла ошибка при добавлении администратора");
        })
    }

    return (
        <div>
            <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">
                Добавить администратора ресторана
            </h2>
            <Alert color="failure"
                   className={error ? 'visible w-full md:max-w-md mx-auto' : 'hidden w-full md:max-w-md mx-auto '}
                   icon={IoIosAlert}>
                {error}
            </Alert>
            <section>
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto mt-8 lg:py-0">
                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md md:max-w-2xl xl:p-0 dark:bg-gray-800
        dark:border-gray-700">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <form className="space-y-4 md:space-y-6" onSubmit={registerAdmin}>
                                <div className="grid grid-flow-col gap-7">
                                    <div>
                                        <div className="mb-2 block">
                                            <Label htmlFor="full_name" value="ФИО"/>
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
                                <Button className="mx-auto" type="submit">Добавить администратора</Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminAdd;