import React, {useState} from 'react';
import {IoIosAlert} from "react-icons/io";
import {Alert, Button, Datepicker, Label, TextInput} from "flowbite-react";
import {formatDate, getBearer} from "../../utils";

const CourierAdd = () => {

    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [salary, setSalary] = useState("");

    const addCourier = (event: React.FormEvent) => {
        event.preventDefault();

        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/couriers`, {
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
                salary: salary
            })
        }).then(async (res) => {
            if (res.status === 200) {
                window.location.href = '/admin';
            } else if (res.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            }
            else {
                let error_message = await res.json();
                let error_text = "";
                for (let message of error_message.error) {
                    error_text += `${message.msg}\n`;
                }
                setError(error_text);
            }
        }).catch(() => {
            setError("Произошла ошибка при добавлении курьера");
        })
    }

    return (
        <div>
            <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">
                Добавить курьера
            </h2>

            <Alert color="failure" className={error ? 'visible w-full md:max-w-md mx-auto' : 'hidden w-full md:max-w-md mx-auto '} icon={IoIosAlert}>
                {error}
            </Alert>

            <form className="w-full md:max-w-md mx-auto" onSubmit={addCourier}>
                <div className="relative z-0 w-full mb-6 group">
                    <div className="mb-2 block">
                        <Label htmlFor="full_name" value="ФИО"/>
                    </div>
                    <TextInput type="text"
                               onChange={(e) => setFullName(e.target.value)}
                               value={fullName}
                               id="full_name" required/>
                </div>
                <div className="relative z-0 w-full mb-6 group">
                    <div className="mb-2 block">
                        <Label htmlFor="email" value="Введите email"/>
                    </div>
                    <TextInput type="email"
                               onChange={(e) => setEmail(e.target.value)}
                               value={email}
                               id="email" placeholder="name@company.com" required/>
                </div>
                <div className="relative z-0 w-full mb-6 group">
                    <div className="mb-2 block">
                        <Label htmlFor="phone_number" value="Номер телефона"/>
                    </div>
                    <TextInput type="tel" pattern="^\+375\(\d{2}\)\d{3}-\d{2}-\d{2}$"
                               onChange={(e) => setPhoneNumber(e.target.value)}
                               value={phoneNumber} placeholder="+375(XX)XXX-XX-XX"
                               id="phone_number" required/>
                </div>
                <div className="relative w-full mb-6 group">
                    <div className="mb-2 block">
                        <Label htmlFor="phone_number" value="Дата рождения"/>
                    </div>
                    <Datepicker
                        onSelectedDateChanged={(date) => setDateOfBirth(formatDate(date))}
                        language="ru-ru" labelTodayButton="Сегодня"
                        labelClearButton="Очистить"
                        weekStart={1} maxDate={new Date()} datepicker-format="dd-mm-yyyy"/>
                </div>
                <div className="relative z-0 w-full mb-6 group">
                    <div className="mb-2 block">
                        <Label htmlFor="full_name" value="Зарплата"/>
                    </div>
                    <TextInput type="text"
                               onChange={(e) => setSalary(e.target.value)}
                               value={salary}
                               id="salary" required/>
                </div>
                <Button className="mx-auto" type="submit">Добавить</Button>
            </form>
        </div>
    );
};

export default CourierAdd;