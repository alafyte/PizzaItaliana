import React, {useEffect, useState} from 'react';
import {OrdersPaginator} from "../../types/models";
import {getBearer, isoStringToDateTime} from "../../utils";
import {Spinner} from "flowbite-react";
import Paginator from "../partials/Paginator";
import {useSearchParams} from "react-router-dom";

const ArchiveOrders = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [done, setDone] = useState(false);
    const [ordersPaginator, setOrdersPaginator] = useState<OrdersPaginator | null>(null);

    useEffect(() => {
        let page = searchParams.get("page");
        page = page === null ? "1" : page;
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/restaurants/restaurant/archive?page=${page}`, {
            method: 'GET',
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
                            ordersPaginator !== null ?
                                <>
                                    <h2 className="lg:text-4xl mt-4 text-3xl font-extrabold dark:text-white text-center mb-8">
                                        Архив заказов ресторана
                                    </h2>

                                    {
                                        ordersPaginator.objects !== null && ordersPaginator.objects.length !== 0 ?
                                            <>
                                                {
                                                    ordersPaginator.objects.map(order =>
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

                                                            <p className="font-normal text-xl dark:text-gray-400">
                                                                Статус заказа: {order.status}
                                                            </p>
                                                        </div>
                                                    )
                                                }
                                                <Paginator paginator={ordersPaginator.paginator}
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

export default ArchiveOrders;