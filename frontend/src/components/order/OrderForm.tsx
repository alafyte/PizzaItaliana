import React, {useState} from 'react';
import {SetTabPropsType} from "../../types";
import {Alert, Button, Label, TextInput} from "flowbite-react";
import {IoIosAlert} from "react-icons/io";
import {getBearer} from "../../utils";
import { socket } from '../socket/socket';

const OrderForm = ({setTab}: SetTabPropsType) => {
    setTab(-1);

    const [error, setError] = useState("");
    const [street, setStreet] = useState("");
    const [houseNum, setHouseNum] = useState("");
    const [building, setBuilding] = useState("");
    const [apartment, setApartment] = useState("");


    const createOrder = (event: React.FormEvent) => {
        try {
            event.preventDefault();

            let address = `${street}, ${houseNum}`
            if (building !== '') {
                address += ` к${building}`;
            }

            if (!Number(apartment)) {
                setError('Номер квартиры должен быть указан числом');
                return;
            }
            if (!Number(houseNum)) {
                setError('Номер дома должен быть указан числом');
                return;
            }

            address += `, кв. ${apartment}`;

            fetch(`https://api.maptiler.com/geocoding/${address}%20Минск%20Беларусь%20220.json?key=${process.env.REACT_APP_MAPTILER_KEY}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.features[0].place_type[0] === 'region' || data.features[0].place_type[0] === 'postal_code')
                        throw new Error("Invalid address")
                    console.log(data.features[0].center)
                    let latitude = Number(data.features[0].center[1]);
                    let longitude = Number(data.features[0].center[0]);

                    console.log(latitude, longitude)

                    let jsonRequestData = {
                        address: address,
                        latitude: latitude,
                        longitude: longitude
                    }

                    fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/order`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': getBearer(),
                            'Access-Control-Allow-Origin': '*',
                        },
                        credentials: 'include',
                        body: JSON.stringify(jsonRequestData)
                    }).then(async (res) => {
                        if (res.status === 200) {
                            const result = await res.json();
                            socket.emit('newOrder', { orderId: result.orderId});
                            window.location.href = '/order';
                        } else if (res.status === 403) {
                            localStorage.removeItem('token');
                            window.location.href = '/users/login';
                        } else {
                            let error_message = await res.json();
                            setError(error_message.error);
                        }
                    }).catch(() => {
                        setError('Произошла ошибка при оформлении заказа');
                    })
                }).catch(() => {
                setError('Произошла ошибка! Невозможно определить местоположение');
            })
        } catch (error) {
            setError('Произошла ошибка! Проверьте введенные данные и повторите попытку');
        }
    }


    return (
        <div>
            <Alert color="failure"
                   className={error ? 'visible w-full md:max-w-md mx-auto mb-4' : 'hidden w-full md:max-w-md mx-auto '}
                   icon={IoIosAlert}>
                {error}
            </Alert>
            <div className="relative w-full max-w-md mx-auto max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="px-6 py-6 lg:px-8">
                        <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">Укажите ваш адрес</h3>
                        <form className="space-y-6 mt-4" onSubmit={e => createOrder(e)}>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="street"
                                           value="Улица (с указанием улица, проспект, переулок и т.д.)"/>
                                </div>
                                <TextInput id="street" type="text" value={street} onChange={e => setStreet(e.target.value)} required shadow/>
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="house_num" value="Дом"/>
                                </div>
                                <TextInput id="house_num" value={houseNum} onChange={e => setHouseNum(e.target.value)} type="text" required shadow/>
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="building" value="Корпус"/>
                                </div>
                                <TextInput id="building" value={building} onChange={e => setBuilding(e.target.value)} type="text" shadow/>
                            </div>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="apartment" value="Квартира"/>
                                </div>
                                <TextInput id="apartment" value={apartment} onChange={e => setApartment(e.target.value)} type="text" required shadow/>
                            </div>
                            <Button className="mx-auto bg-blue-700" type="submit">Оформить заказ</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderForm;