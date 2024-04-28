import React, {useEffect, useState} from 'react';
import {Alert, Spinner} from "flowbite-react";
import {IoIosAlert} from "react-icons/io";
import {Cart} from "../../types/models";
import {Button, Modal} from 'flowbite-react';
import {HiOutlineExclamationCircle} from 'react-icons/hi';
import {SetTabPropsType} from "../../types";
import {getBearer} from "../../utils";

const UserCart = ({setTab}: SetTabPropsType) => {
    setTab(-1);

    const [done, setDone] = useState(false);
    const [error, setError] = useState("");
    const [cartItems, setCartItems] = useState<Cart | null>(null);
    const [openModal, setOpenModal] = useState(false);

    const getCartItems = () => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/cart`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
        }).then(async response => {
            if (response.status === 200) {
                setCartItems(await response.json());
            } else if (response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            } else {
                setError('Произошла ошибка при получении данных о корзине');
            }
        }).catch(() => {
            setError('Произошла ошибка при получении данных о корзине');
        }).finally(() => setDone(true));
    }

    useEffect(getCartItems, []);

    const addOne = (id: number) => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/cart/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
            body: JSON.stringify({count: 1})
        }).then(async (res) => {
            if (res.status !== 200) {
                let error_message = await res.json();
                setError(error_message.error);
            } else {
                getCartItems();
                setError("");
            }
        }).catch(err => console.log(err))
    }


    const removeOne = (id: number) => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/cart/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
            body: JSON.stringify({count: -1})
        }).then(async (res) => {
            if (res.status === 200) {
                getCartItems();
                setError("");
            } else if (res.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            } else {
                let error_message = await res.json();
                setError(error_message.error);
            }
        }).catch(err => console.log(err))
    }

    const deleteItem = (id: number) => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/cart/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
        }).then(async (res) => {
            if (res.status === 200) {
                getCartItems();
                setError("");
            } else if (res.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            } else {
                let error_message = await res.json();
                setError(error_message.error);
            }
        }).catch(err => console.log(err))
    }

    const purgeCart = () => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/cart/purge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
        }).then(async (res) => {
            if (res.status === 200) {
                getCartItems();
                setError("");
            } else if (res.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            } else {
                let error_message = await res.json();
                setError(error_message.error);
            }
            setOpenModal(false)
        }).catch(err => console.log(err))
    }

    return (
        <div>
            <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">
                Корзина
            </h2>

            <Alert color="failure"
                   className={error ? 'visible w-full md:max-w-md mx-auto mb-4' : 'hidden w-full md:max-w-md mx-auto '}
                   icon={IoIosAlert}>
                {error}
            </Alert>

            {
                done ?
                    <div>
                        {
                            cartItems !== null && cartItems.cart_items.length !== 0 ?
                                <>
                                    <Button className="mx-auto bg-blue-700" onClick={() => setOpenModal(true)}>Очистить
                                        корзину</Button>
                                    <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
                                        <Modal.Header/>
                                        <Modal.Body>
                                            <div className="text-center">
                                                <HiOutlineExclamationCircle
                                                    className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200"/>
                                                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                                    Вы уверены, что хотите очистить корзину?
                                                </h3>
                                                <div className="flex justify-center gap-4">
                                                    <Button color="failure" onClick={purgeCart}>
                                                        Да, я уверен
                                                    </Button>
                                                    <Button color="gray" onClick={() => setOpenModal(false)}>
                                                        Отмена
                                                    </Button>
                                                </div>
                                            </div>
                                        </Modal.Body>
                                    </Modal>
                                    {
                                        cartItems.cart_items.map(cartItem =>
                                            <div
                                                className="w-full mx-auto max-w-sm bg-white shadow mb-4 rounded-lg dark:bg-gray-800 dark:border-gray-700">
                                                <div className="flex justify-end">
                                                    <button onClick={() => deleteItem(cartItem.id)}
                                                            className="inline-block text-gray-500 w-fit dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5"
                                                            type="button">
                                                        <span className="sr-only">Delete from cart</span>
                                                        <svg className="w-4 h-4 text-gray-800 dark:text-white"
                                                             aria-hidden="true"
                                                             xmlns="http://www.w3.org/2000/svg" fill="none"
                                                             viewBox="0 0 14 14">
                                                            <path stroke="currentColor" stroke-linecap="round"
                                                                  stroke-linejoin="round"
                                                                  stroke-width="2"
                                                                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div
                                                    className="flex flex-col items-center mx-auto md:flex-row md:max-w-md">
                                                    <img
                                                        className="object-cover h-60 md:h-auto md:w-44 md:rounded-none md:rounded-l-lg"
                                                        src={`${process.env.REACT_APP_SERVER_ADDRESS}/${cartItem.menu_item_info.menu.item_image}`}
                                                        alt={cartItem.menu_item_info.menu.item_name}/>
                                                    <div className="flex flex-col p-4 leading-normal">
                                                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                            {cartItem.menu_item_info.menu.item_name}
                                                        </h5>
                                                        {
                                                            cartItem.notes !== null && cartItem.notes.length !== 0 ?
                                                                <p className="mb-3 text-sm font-normal text-gray-700 dark:text-white">
                                                                    Убрать: {cartItem.notes}
                                                                </p>
                                                                :
                                                                <></>
                                                        }
                                                        <p className="mb-3 text-lg font-normal text-gray-700 dark:text-white">
                                                            {cartItem.menu_item_info.size_category.item_size} см
                                                        </p>
                                                        <div className="flex items-center space-x-3">
                                                            <button onClick={() => removeOne(cartItem.id)}
                                                                    className="inline-flex items-center justify-center p-1 text-sm font-medium h-6 w-6 text-gray-500 bg-white border border-gray-300 rounded-full focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                                                    type="button">
                                                                <span className="sr-only">Quantity button</span>
                                                                <svg className="w-3 h-3" aria-hidden="true"
                                                                     xmlns="http://www.w3.org/2000/svg" fill="none"
                                                                     viewBox="0 0 18 2">
                                                                    <path stroke="currentColor" stroke-linecap="round"
                                                                          stroke-linejoin="round" stroke-width="2"
                                                                          d="M1 1h16"/>
                                                                </svg>
                                                            </button>
                                                            <div>
                                                                <input type="number" id="first_product"
                                                                       className="bg-gray-50 w-14 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                                       value={cartItem.item_quantity} required/>
                                                            </div>
                                                            <button onClick={() => addOne(cartItem.id)}
                                                                    className="inline-flex items-center justify-center h-6 w-6 p-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-full focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                                                    type="button">
                                                                <span className="sr-only">Quantity button</span>
                                                                <svg className="w-3 h-3" aria-hidden="true"
                                                                     xmlns="http://www.w3.org/2000/svg" fill="none"
                                                                     viewBox="0 0 18 18">
                                                                    <path stroke="currentColor" stroke-linecap="round"
                                                                          stroke-linejoin="round" stroke-width="2"
                                                                          d="M9 1v16M1 9h16"/>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <p className="price-area mb-3 mt-3 text-xl font-normal dark:text-white">
                                                            Цена: {cartItem.current_price} р.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>)
                                    }
                                    <h2 className="lg:text-xl text-3xl font-extrabold dark:text-white text-center mb-8">
                                        Итоговая цена: {cartItems.result_price} р.
                                    </h2>
                                    <div className="w-full flex justify-center md:max-w-6xl mx-auto mt-8">
                                        <a href="/order/make-order" className="cursor-pointer text-white w-fit bg-blue-700 hover:bg-blue-800 focus:ring-4
    focus:ring-blue-300 font-medium rounded-lg text-sm
px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                            Заказать
                                        </a>
                                    </div>
                                </> :
                                <h2 className="lg:text-xl text-3xl font-extrabold dark:text-white text-center mb-8">
                                    Корзина пуста
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

export default UserCart;