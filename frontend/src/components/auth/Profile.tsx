import React, {useEffect, useState} from 'react';
import {LoginFormPropsType} from "../../types";
import {Alert, Button, Datepicker, Label, Spinner, TextInput} from "flowbite-react";
import {IoIosAlert} from "react-icons/io";
import {formatDate, getBearer} from "../../utils";
import {PersonalDataType, User} from "../../types/models";
import {jwtDecode} from "jwt-decode";

const Profile = ({setTab, setUser} : LoginFormPropsType) => {
    setTab(-1);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [done, setDone] = useState(false);

    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");

    const getUser = () => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/user`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include'
        }).then(async (response) => {
            if (response.status === 200) {
                let user: PersonalDataType = await response.json();
                setFullName(user.full_name);
                setEmail(user.email);
                setPhoneNumber(user.phone_number);
                setDateOfBirth(user.date_of_birth);
            } else if (response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            }
        }).catch(err => console.log(err)).finally(() => setDone(true))
    }

    useEffect(getUser, []);

    const updateProfile = (event: React.FormEvent) => {
        event.preventDefault();

        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/user`, {
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
            })
        }).then(async (response) => {
            if (response.status === 200) {
                let user: User = jwtDecode(getBearer());
                user.personal_data_rel.full_name = fullName;
                user.personal_data_rel.email = email;
                user.personal_data_rel.phone_number = phoneNumber;
                user.personal_data_rel.date_of_birth = dateOfBirth;
                setUser(user);
                setSuccess("Данные профиля успешно обновлены!");
            } else if (response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            } else {
                let error_message = await response.json();
                let error_text = "";
                for (let message of error_message.error) {
                    error_text += `${message.msg}\n`;
                }
                setError(error_text);
            }
        }).catch(() => {
            setError("Произошла ошибка при изменении профиля");
        })
    }

    return (
        <div>
            {
                done ?
                    <div>
                        <Alert color="success"
                               className={success ? 'visible w-full md:max-w-md mx-auto' : 'hidden w-full md:max-w-md mx-auto '}
                               icon={IoIosAlert}>
                            <p>{success}</p>
                        </Alert>
                        <Alert color="failure"
                               className={error ? 'visible w-full md:max-w-md mx-auto' : 'hidden w-full md:max-w-md mx-auto '}
                               icon={IoIosAlert}>
                            {error.split("\n").map(error => <p>{error}</p>)}
                        </Alert>
                        <section>
                            <div
                                className="flex flex-col items-center justify-center px-6 py-8 mx-auto mt-8 lg:py-0">
                                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md md:max-w-2xl xl:p-0 dark:bg-gray-800
        dark:border-gray-700">
                                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                                        <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">
                                            Ваш профиль
                                        </h2>
                                        <form className="space-y-4 md:space-y-6" onSubmit={updateProfile}>
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
                                                        <Label htmlFor="email" value="Email"/>
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
                                                    <TextInput type="tel"
                                                               pattern="^\+375\(\d{2}\)\d{3}-\d{2}-\d{2}$"
                                                               onChange={(e) => setPhoneNumber(e.target.value)}
                                                               value={phoneNumber} placeholder="+375(XX)XXX-XX-XX"
                                                               id="phone_number" required/>
                                                </div>
                                                <div>
                                                    <div className="mb-2 block">
                                                        <Label htmlFor="date_of_birth" value="Дата рождения"/>
                                                    </div>
                                                    <Datepicker
                                                        value={formatDate(new Date(dateOfBirth))}
                                                        onSelectedDateChanged={(date) => setDateOfBirth(formatDate(date))}
                                                        language="ru-ru" labelTodayButton="Сегодня"
                                                        labelClearButton="Очистить"
                                                        weekStart={1} maxDate={new Date()}
                                                        datepicker-format="dd-mm-yyyy"/>
                                                </div>
                                            </div>
                                            <Button className="mx-auto" type="submit">Изменить данные
                                                профиля</Button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    :
                    <div className="text-center mt-4">
                        <Spinner aria-label="spinner" size="xl"/>
                    </div>
            }
        </div>
    );
};

export default Profile;