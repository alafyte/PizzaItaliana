import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {Alert, Button, Checkbox, Datepicker, Label, Modal, Spinner, TextInput} from "flowbite-react";
import {IoIosAlert} from "react-icons/io";
import {formatDate, getBearer} from "../../utils";
import {Courier} from "../../types/models";
import {HiOutlineExclamationCircle} from "react-icons/hi";

const CourierUpdate = () => {
    const {id} = useParams();
    const [openModal, setOpenModal] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [salary, setSalary] = useState("");
    const [active, setActive] = useState(false);


    useEffect(() => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/couriers/${id}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
        }).then(async (response) => {
            if (response.status === 200) {
                let courier: Courier = await response.json();
                setFullName(courier.personal_data_rel.full_name);
                setEmail(courier.personal_data_rel.email);
                setPhoneNumber(courier.personal_data_rel.phone_number);
                setDateOfBirth(courier.personal_data_rel.date_of_birth);
                setSalary(courier.salary.toString());
                setActive(courier.active);
            } else if (response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            }
        }).catch(err => console.log(err)).finally(() => setDone(true))
    }, [id]);

    const updateCourier = (event: React.FormEvent) => {
        event.preventDefault();

        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/couriers/${id}`, {
            method: 'PUT',
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
                salary: salary,
                active: active,
            })
        }).then(async (res) => {
            if (res.status === 200) {
                window.location.href = '/admin';
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
            setError("Произошла ошибка при обновлении курьера");
        })
    }

    const deleteCourier = () => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/couriers/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
        }).then(async (res) => {
            if (res.status === 200) {
                window.location.href = '/admin';
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
                setOpenModal(false);
            }
        }).catch(() => {
            setOpenModal(false);
            setError("Произошла ошибка при удалении курьера");
        })
    }

    return (
        <div>
            <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">
                Изменить курьера
            </h2>
            {
                done ?
                    <div>
                        <Alert color="failure"
                               className={error ? 'visible w-full md:max-w-md mx-auto' : 'hidden w-full md:max-w-md mx-auto '}
                               icon={IoIosAlert}>
                            {error}
                        </Alert>

                        <form className="w-full md:max-w-md mx-auto" onSubmit={updateCourier}>
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
                                <Datepicker value={formatDate(new Date(dateOfBirth))}
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
                            <div className="flex items-center gap-2  mb-4">
                                <Checkbox id="active" checked={active}
                                          onChange={(e) => setActive(!!e.currentTarget.checked)}/>
                                <Label htmlFor="active">Активен</Label>
                            </div>
                            <div className="flex justify-between">
                                <Button type="submit">Изменить</Button>
                                <Button color="failure" onClick={() => setOpenModal(true)}>Удалить</Button>
                                <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
                                    <Modal.Header/>
                                    <Modal.Body>
                                        <div className="text-center">
                                            <HiOutlineExclamationCircle
                                                className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200"/>
                                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                                Вы уверены, что хотите удалить
                                                этого курьера?
                                            </h3>
                                            <div className="flex justify-center gap-4">
                                                <Button color="failure" onClick={() => deleteCourier()}>
                                                    Да, я уверен
                                                </Button>
                                                <Button color="gray" onClick={() => setOpenModal(false)}>
                                                    Отмена
                                                </Button>
                                            </div>
                                        </div>
                                    </Modal.Body>
                                </Modal>
                            </div>
                        </form>
                    </div>
                    :
                    <div className="text-center mt-4">
                        <Spinner aria-label="spinner" size="xl"/>
                    </div>
            }
        </div>
    );
};

export default CourierUpdate;