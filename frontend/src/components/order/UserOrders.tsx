import React, {useEffect, useState} from 'react';
import {SetTabPropsType} from "../../types";
import {OrdersPaginator} from "../../types/models";
import {getBearer, isoStringToDateTime} from "../../utils";
import {Spinner} from "flowbite-react";
import Paginator from "../partials/Paginator";
import {useSearchParams} from "react-router-dom";

const UserOrders = ({setTab}: SetTabPropsType) => {
    setTab(-1);

    const [searchParams, setSearchParams] = useSearchParams();
    const [done, setDone] = useState(false);
    const [ordersPaginator, setOrdersPaginator] = useState<OrdersPaginator | null>(null);

    useEffect(() => {
        let page = searchParams.get("page");
        page = page === null ? "1" : page;

        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/order?page=${page}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
        }).then(async (response) => {
            if (response.status === 200) {
                setOrdersPaginator(await response.json());
            } else if (response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            }
        }).catch(err => console.log(err)).finally(() => setDone(true));
    }, [searchParams]);

    const changePage = (page: number) => {
        setSearchParams({page: page.toString()});
    }

    return (
        <div>
            {
                done ?
                    <div>
                        {
                            ordersPaginator !== null && ordersPaginator.objects.length !== 0 ?
                                <>
                                    <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">
                                        Ваши заказы
                                    </h2>
                                    {
                                        ordersPaginator.objects.map(order =>
                                            <div
                                                className="block mx-auto mb-3  max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow  dark:bg-gray-800 dark:border-gray-700">
                                                <p className="font-normal text-xl dark:text-gray-400">
                                                    Заказ №{order.id}
                                                </p>
                                                <p className="font-normal text-xl dark:text-gray-400">
                                                    Дата заказа: {isoStringToDateTime(order.date_of_order)}
                                                </p>
                                                <p className="font-normal text-lg dark:text-gray-400">
                                                    На адрес: {order.address}
                                                </p>
                                                {
                                                    order.order_items.map((orderItem =>
                                                            <div
                                                                className="w-full mx-auto max-w-sm bg-white mb-4 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                                                                <div
                                                                    className="flex flex-col items-center mx-auto md:flex-row md:max-w-md">
                                                                    <img
                                                                        className="object-cover h-40 md:h-auto md:w-44 md:rounded-none md:rounded-l-lg"
                                                                        src={`${process.env.REACT_APP_SERVER_ADDRESS}/${orderItem.menu_item_info.menu.item_image}`}
                                                                        alt={orderItem.menu_item_info.menu.item_name}/>
                                                                    <div className="flex flex-col p-4 leading-normal">
                                                                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                                            {orderItem.menu_item_info.menu.item_name}
                                                                        </h5>
                                                                        {
                                                                            orderItem.notes !== null && orderItem.notes.length !== 0 ?
                                                                                <p className="mb-3 text-sm font-normal text-gray-700 dark:text-white">
                                                                                    Убрать: {orderItem.notes}
                                                                                </p>
                                                                                :
                                                                                <></>
                                                                        }
                                                                        <p className="mb-3 text-md font-normal text-gray-700 dark:text-white">
                                                                            {orderItem.menu_item_info.size_category.item_size} см
                                                                        </p>
                                                                        <p className="mb-3 text-md font-normal text-gray-700 dark:text-white">
                                                                            Количество: {orderItem.item_quantity}
                                                                        </p>
                                                                        <p className="price-area mb-3 text-md font-normal dark:text-white">
                                                                            Цена: {orderItem.item_total_price} р.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                    ))
                                                }

                                                <p className="font-normal text-xl dark:text-gray-400">
                                                    Итого: {order.total_price} р.
                                                </p>
                                                <p className="font-normal text-xl dark:text-gray-400">
                                                    Статус заказа: {order.status}
                                                </p>
                                            </div>
                                        )
                                    }
                                    <Paginator paginator={ordersPaginator.paginator} changePage={changePage}/>
                                </>
                                :
                                <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">
                                    У вас ещё нет заказов
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

export default UserOrders;