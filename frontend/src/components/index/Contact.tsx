import React, {useEffect, useState} from 'react';
import {SetTabPropsType} from "../../types";
import {Alert, Button, Spinner} from "flowbite-react";
import {IoIosAlert} from "react-icons/io";
import {Restaurant} from "../../types/models";
import {isoStringToTime} from "../../utils";

const Contact = ({setTab}: SetTabPropsType) => {
    setTab(3);

    const [done, setDone] = useState(false);
    const [error, setError] = useState("");
    const [address, setAddress] = useState("");
    const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/restaurants`, {
            method: "GET"
        }).then(async (response) => {
            if (response.status === 200) {
                setRestaurants(await response.json());
            } else {
                setError("Произошла ошибка при получении ресторанов")
            }
        }).catch(() => setError("Произошла ошибка при получении ресторанов")).finally(() => setDone(true));
    }, []);

    const getNearestRestaurant = () => {
        navigator.geolocation.getCurrentPosition((success) => {
            console.log(success.coords.latitude, success.coords.longitude);
            let {latitude, longitude} = success.coords;
            let jsonRequestData = {
                latitude: Number(latitude),
                longitude: Number(longitude)
            }

            fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/restaurants/find`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonRequestData)
            }).then(async (res) => {
                if (res.status === 200) {
                    let message = await res.json();
                    setAddress(message.message);
                } else {
                    let error_message = await res.json();
                    setError(error_message.error);
                }
            }).catch(() => setError("Произошла ошибка при получении ближайшего ресторана"))
        })
    }

    return (
        <div>
            <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">Наши рестораны</h2>
            <Alert color="failure"
                   className={error ? 'visible w-full md:max-w-md mx-auto' : 'hidden w-full md:max-w-md mx-auto '}
                   icon={IoIosAlert}>
                {error}
            </Alert>

            {
                done ?
                    <div>
                        {
                            restaurants ?
                                <>
                                    <div
                                        className="md:max-w-xl lg:max-w-7xl md:mx-auto w-full px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {
                                            restaurants.map(rest =>
                                                <div
                                                    className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                                                    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                        {rest.address}
                                                    </h5>
                                                    <p className="font-normal text-gray-700 dark:text-gray-400 p-0">
                                                        Ежедневно
                                                    </p>
                                                    <p className="font-normal text-gray-700 dark:text-gray-400 p-0">
                                                        Время
                                                        работы: {isoStringToTime(rest.open_time)} - {isoStringToTime(rest.close_time)}
                                                    </p>
                                                    <p className="font-normal text-gray-700 dark:text-gray-400 p-0">
                                                        Доставка: {isoStringToTime(rest.delivery_start_time)} - {isoStringToTime(rest.delivery_end_time)}
                                                    </p>
                                                </div>)
                                        }
                                    </div>
                                    <Button className="bg-blue-700 w-fit mx-auto mb-2 mt-8">
                                        <a href="/map"> Посмотреть карту доставки</a>
                                    </Button>

                                    <Button onClick={getNearestRestaurant}
                                            className="bg-blue-700 w-fit mx-auto mb-2 mt-8">
                                        Найти ближайший ресторан
                                    </Button>
                                </> :
                                <h2 className="lg:text-4xl mt-4 text-3xl font-extrabold dark:text-white text-center mb-8">
                                    Рестораны не найдены
                                </h2>
                        }

                        <Alert color="info"
                               className={address ? 'visible w-full md:max-w-md mx-auto' : 'hidden w-full md:max-w-md mx-auto '}>
                            {address}
                        </Alert>
                    </div>
                    :
                    <div className="text-center mt-4">
                        <Spinner aria-label="spinner" size="xl"/>
                    </div>
            }
        </div>
    );
};

export default Contact;