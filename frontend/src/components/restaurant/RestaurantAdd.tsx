import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import {Alert, Button, FileInput, Label, Select, Spinner, TextInput} from "flowbite-react";
import {IoIosAlert} from "react-icons/io";
import {UnassignedAdmin} from "../../types/models";
import {getBearer} from "../../utils";

const RestaurantAdd = () => {
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);
    const [admins, setAdmins] = useState<UnassignedAdmin[] | null>(null);
    const [address, setAddress] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [admin, setAdmin] = useState("");
    const [openTime, setOpenTime] = useState("");
    const [closeTime, setCloseTime] = useState("");
    const [deliveryStartTime, setDeliveryStartTime] = useState("");
    const [deliveryEndTime, setDeliveryEndTime] = useState("");

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    useEffect(() => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/restaurants/unassigned-admins`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
        }).then(async (response) => {
            if (response.status === 200) {
                setAdmins(await response.json());
            } else if (response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            }
        }).catch(err => console.log(err)).finally(() => setDone(true))
    }, []);

    useEffect(() => {
        if (admins) {
            setAdmin(admins[0].id.toString());
        }
    }, [admins]);

    const addRestaurant = (e: FormEvent) => {
        try {
            e.preventDefault();

            if (!file) {
                console.error('Файл не выбран');
                return;
            }

            const formData = new FormData();
            formData.append('coverage_area', file);
            formData.append('address', address);
            formData.append('admins', admin);
            formData.append('open_time', openTime);
            formData.append('close_time', closeTime);
            formData.append('delivery_start_time', deliveryStartTime);
            formData.append('delivery_end_time', deliveryEndTime);

            fetch(`https://api.maptiler.com/geocoding/${address}%20Минск%20Беларусь%20220.json?key=${process.env.REACT_APP_MAPTILER_KEY}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data.features[0].place_type[0] === 'region' || data.features[0].place_type[0] === 'postal_code')
                        throw new Error("Invalid address")
                    console.log(data.features[0].center)
                    let latitude = data.features[0].center[1];
                    let longitude = data.features[0].center[0];

                    console.log(latitude, longitude)

                    formData.append('latitude', latitude);
                    formData.append('longitude', longitude);

                    fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/restaurants`, {
                        method: 'POST',
                        headers: {
                            'Authorization': getBearer(),
                            'Access-Control-Allow-Origin': '*',
                        },
                        credentials: 'include',
                        body: formData
                    }).then(async (res) => {
                        if (res.status === 200) {
                            window.location.href = '/admin/head/restaurants';
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
            <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">
                Добавить ресторан
            </h2>
            <Alert color="failure"
                   className={error ? 'visible w-full md:max-w-md mx-auto' : 'hidden w-full md:max-w-md mx-auto '}
                   icon={IoIosAlert}>
                {error}
            </Alert>
            {
                done ?
                    <form className="w-full md:max-w-md mx-auto" onSubmit={addRestaurant}>
                        <div className="relative z-0 w-full mb-6 group">
                            <div className="mb-2 block">
                                <Label htmlFor="address" value="Адрес ресторана"/>
                            </div>
                            <TextInput type="text"
                                       onChange={(e) => setAddress(e.target.value)}
                                       value={address}
                                       id="address" required/>
                        </div>
                        <div id="fileUpload" className="max-w-md">
                            <div className="mb-2 block">
                                <Label htmlFor="file" value="Зона доставки"/>
                            </div>
                            <FileInput id="file" onChange={handleFileChange} required helperText="geojson файлы"/>
                        </div>
                        <div className="mb-2 block">
                            <Label htmlFor="admins" value="Администратор"/>
                        </div>
                        <Select id="admins" required value={admin} onChange={(e) => setAdmin(e.target.value)}>
                            {
                                admins !== null ?
                                    admins.map(admin => <option
                                        value={admin.id}>{admin.personal_data_rel.full_name}</option>)
                                    : <></>

                            }
                        </Select>
                        <div className="grid md:grid-cols-2 md:gap-6">
                            <div className="relative z-0 w-full mb-6 group">
                                <div className="mb-2 block">
                                    <Label htmlFor="open_time" value="Время открытия"/>
                                </div>
                                <TextInput type="time"
                                           onChange={(e) => setOpenTime(e.target.value)}
                                           value={openTime}
                                           id="open_time" required/>
                            </div>
                            <div className="relative z-0 w-full mb-6 group">
                                <div className="mb-2 block">
                                    <Label htmlFor="close_time" value="Время закрытия"/>
                                </div>
                                <TextInput type="time"
                                           onChange={(e) => setCloseTime(e.target.value)}
                                           value={closeTime}
                                           id="close_time" required/>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 md:gap-6">
                            <div className="relative z-0 w-full mb-6 group">
                                <div className="mb-2 block">
                                    <Label htmlFor="delivery_start_time" value="Начало работы доставки"/>
                                </div>
                                <TextInput type="time"
                                           onChange={(e) => setDeliveryStartTime(e.target.value)}
                                           value={deliveryStartTime}
                                           id="delivery_start_time" required/>
                            </div>
                            <div className="relative z-0 w-full mb-6 group">
                                <div className="mb-2 block">
                                    <Label htmlFor="delivery_end_time" value="Окончание работы доставки"/>
                                </div>
                                <TextInput type="time"
                                           onChange={(e) => setDeliveryEndTime(e.target.value)}
                                           value={deliveryEndTime}
                                           id="delivery_end_time" required/>
                            </div>
                        </div>
                        <Button className="mx-auto" type="submit">Добавить</Button>
                    </form>
                    :
                    <div className="text-center mt-4">
                        <Spinner aria-label="spinner" size="xl"/>
                    </div>
            }
        </div>
    );
};

export default RestaurantAdd;