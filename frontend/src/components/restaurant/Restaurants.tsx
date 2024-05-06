import React, {useEffect, useState} from 'react';
import {isoStringToTime} from "../../utils";
import {Restaurant} from "../../types/models";
import {HeadAdminPanelPropsType} from "../../types";
import AdminMenuTabs from "../admin/AdminMenuTabs";
import {Spinner} from "flowbite-react";

const Restaurants = ({setTab, adminMenu}: HeadAdminPanelPropsType) => {
    setTab(-1);


    const [done, setDone] = useState(false);
    const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/restaurants`, {
            method: "GET"
        }).then(async (response) => {
            if (response.status === 200) {
                let rests: Restaurant[] = await response.json();
                setRestaurants(rests);
            }
        }).catch(err => console.log(err)).finally(() => setDone(true));
    }, []);

    return (
        <div>
            <AdminMenuTabs currentTab={2} adminMenu={adminMenu}/>

            {
                done ?
                    <div>
                        <div className="w-full md:max-w-6xl mx-auto mt-8">
                            <a href="/restaurants/add" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm
px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                Добавить ресторан
                            </a>
                            <a href="/map" className="py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border
border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200
dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white
dark:hover:bg-gray-700">
                                Посмотреть карту доставки
                            </a>
                        </div>
                        {
                            restaurants ?
                                <div
                                    className="md:max-w-xl mt-8 lg:max-w-7xl md:mx-auto w-full px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {
                                        restaurants.map(rest =>
                                            <a href={`/restaurants/update/${rest.id}`}
                                               className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                                                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                    {rest.address}
                                                </h5>
                                                <h6 className="font-bold text-gray-700 dark:text-gray-400">
                                                    Администратор: {rest.restaurant_admin}
                                                </h6>
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
                                            </a>)
                                    }
                                </div> :
                                <h2 className="lg:text-4xl mt-4 text-3xl font-extrabold dark:text-white text-center mb-8">
                                    Рестораны не найдены
                                </h2>
                        }
                    </div>
                    :
                    <div className="text-center mt-4">
                        <Spinner aria-label="spinner" size="xl"/>
                    </div>
            }
        </div>
    );
};

export default Restaurants;