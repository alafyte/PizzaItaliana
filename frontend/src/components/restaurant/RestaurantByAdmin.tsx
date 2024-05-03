import React, {useEffect, useState} from 'react';
import {RestaurantByAdminType} from "../../types/models";
import {getBearer, isoStringToDateTime, isoStringToTime} from "../../utils";
import {Button, Modal, Select, Spinner} from "flowbite-react";
import Paginator from "../partials/Paginator";
import {useSearchParams} from "react-router-dom";
import { socket } from '../socket/socket';

const RestaurantByAdmin = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [done, setDone] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [status, setStatus] = useState("");
    const [orderId, setOrderId] = useState(0);
    const [userId, setUserId] = useState(0);
    const [restaurantInfo, setRestaurantInfo] = useState<RestaurantByAdminType | null>(null);

    const getRestaurantInfo = () => {
        let page = searchParams.get("page");

        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/restaurants/restaurant?page=${page}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
        }).then(async (response) => {
            if (response.status === 200) {
                setRestaurantInfo(await response.json());
            } else if (response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            }
        }).catch().finally(() => setDone(true))

        return () => {
            socket.off('setOrderStatus');
        };
    }

    useEffect(getRestaurantInfo, [searchParams]);

    const setModalId = (orderId: number, userId: number, status: string) => {
        setOpenModal(true);
        setOrderId(orderId);
        setUserId(userId);
        setStatus(status);
    }

    const changePage = (page: number) => {
        setSearchParams({page: page.toString()});
    }


    const changeStatus = () => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/order/${orderId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                status: status
            }),
            credentials: 'include',
        }).then(async (response) => {
            if (response.status === 200) {
                getRestaurantInfo();
                setOpenModal(false);
                console.log(userId)
                socket.emit('setOrderStatus', { status: status, clientId: userId, orderId: orderId });
            } else if (response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            }
        }).catch().finally(() => setDone(true))
    }

    return (
        <div>
            {
                done ?
                    <div>
                        {
                            restaurantInfo !== null ?
                                <>
                                    <h2 className="text-4xl font-extrabold text-center mt-8 dark:text-white">
                                        Информация о ресторане по адресу {restaurantInfo.restaurant.address}
                                    </h2>

                                    <p className="text-lg text-center mt-4 dark:text-white">
                                        Ресторан работает
                                        с {isoStringToTime(restaurantInfo.restaurant.open_time)} до {isoStringToTime(restaurantInfo.restaurant.close_time)}
                                    </p>

                                    <p className="text-lg text-center mt-2 dark:text-white">
                                        Доставка работает
                                        с {isoStringToTime(restaurantInfo.restaurant.delivery_start_time)} до {isoStringToTime(restaurantInfo.restaurant.delivery_end_time)}
                                    </p>

                                    <h2 className="lg:text-4xl mt-8 text-3xl font-extrabold dark:text-white text-center mb-8">
                                        Заказы ресторана
                                    </h2>

                                    {
                                        restaurantInfo.paginator.objects !== null && restaurantInfo.paginator.objects.length !== 0 ?
                                            <>{restaurantInfo.paginator.objects.map(order =>
                                                <div
                                                    className="block mx-auto mb-3 max-w-xl p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                                    <p className="font-bold text-xl dark:text-gray-400">
                                                        Заказ №: {order.id}
                                                    </p>
                                                    <p className=" text-xl dark:text-gray-400">
                                                        Дата
                                                        заказа: {isoStringToDateTime(order.date_of_order)}
                                                    </p>
                                                    <p className="font-bold text-xl dark:text-gray-400">
                                                        На адрес: {order.address}
                                                    </p>
                                                    <p className="text-xl dark:text-gray-400">
                                                        На
                                                        имя: {order.app_user?.personal_data_rel.full_name}, {order.app_user?.personal_data_rel.phone_number}
                                                    </p>
                                                    {
                                                        order.order_items.map(item =>
                                                            <div
                                                                className="w-full max-w-sm bg-white rounded-lg dark:bg-gray-800 dark:border-gray-700">
                                                                <div className="flex flex-col">
                                                                    <h5 className="text-xl italic tracking-tight text-gray-900 dark:text-white">
                                                                        - {item.menu_item_info.menu.item_name}
                                                                    </h5>
                                                                    {
                                                                        item.notes !== null && item.notes.length !== 0 ?
                                                                            <p className="uppercase text-md font-bold text-red-700 dark:text-white">
                                                                                Убрать: {item.notes}
                                                                            </p>
                                                                            :
                                                                            <></>
                                                                    }
                                                                    <p className="text-md font-normal text-gray-700 dark:text-white">
                                                                        {item.menu_item_info.size_category.item_size} см,
                                                                        количество: {item.item_quantity}
                                                                    </p>
                                                                </div>
                                                            </div>)
                                                    }

                                                    <p className="font-normal text-xl dark:text-gray-400">
                                                        Итоговая цена: {order.total_price} р.
                                                    </p>
                                                    <div className="flex justify-between">
                                                        <p className="font-normal text-xl dark:text-gray-400">
                                                            Статус заказа: {order.status}
                                                        </p>
                                                        <Button color="blue" onClick={() => setModalId(order.id, Number(order.app_user?.id), order.status)}>Изменить
                                                            статус</Button>
                                                        <Modal show={openModal} size="md"
                                                               onClose={() => setOpenModal(false)} popup>
                                                            <Modal.Header/>
                                                            <Modal.Body>
                                                                <div className="text-center">
                                                                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                                                        Выберите новый статус:
                                                                    </h3>
                                                                    <Select id="status" required value={status}
                                                                            onChange={(e) => setStatus(e.target.value)}>
                                                                        <option value="В работе">В работе</option>
                                                                        <option value="Готов">Готов</option>
                                                                        <option value="Доставляется">Доставляется
                                                                        </option>
                                                                        <option value="Завершён">Завершён</option>
                                                                    </Select>
                                                                    <div className="flex mt-4 justify-center gap-4">
                                                                        <Button color="blue"
                                                                                onClick={() => changeStatus()}>
                                                                            Изменить
                                                                        </Button>
                                                                        <Button color="gray"
                                                                                onClick={() => setOpenModal(false)}>
                                                                            Отмена
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </Modal.Body>
                                                        </Modal>
                                                    </div>
                                                </div>
                                            )
                                            }
                                                <Paginator paginator={restaurantInfo.paginator.paginator}
                                                           changePage={changePage}/>
                                            </>
                                            :
                                            <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">
                                                Eщё нет заказов
                                            </h2>
                                    }
                                </>
                                :
                                <>Ресторан не найден</>
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

export default RestaurantByAdmin;