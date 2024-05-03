import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {getBearer} from "../../utils";
import {Ingredient} from "../../types/models";
import {Alert, Button, Checkbox, Label, Modal, Spinner, TextInput} from "flowbite-react";
import {IoIosAlert} from "react-icons/io";
import {HiOutlineExclamationCircle} from "react-icons/hi";

const IngredientUpdate = () => {
    const {id} = useParams();
    const [openModal, setOpenModal] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [removable, setRemovable] = useState(false);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/ingredient/${id}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
        }).then(async (response) => {
            if (response.status === 200) {
                let ingr: Ingredient = await response.json();
                setName(ingr.name);
                setRemovable(ingr.removable);
            } else if (response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            }
        }).catch(err => console.log(err)).finally(() => setDone(true))
    }, [id]);

    const updateIngredient = (event: React.FormEvent) => {
        event.preventDefault();

        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/ingredient/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
            body: JSON.stringify({
                ingredient_name: name,
                removable: removable,
            })
        }).then(async (res) => {
            if (res.status === 200) {
                window.location.href = '/admin/head/ingredients';
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
            setError("Произошла ошибка при обновлении ингредиента");
        })
    }

    const deleteIngredient = () => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/ingredient/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
        }).then(async (res) => {
            if (res.status === 200) {
                window.location.href = '/admin/head/ingredients';
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
            setError("Произошла ошибка при удалении ингредиента");
        })
    }


    return (
        <div>
            <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">
                Изменить ингредиент
            </h2>
            {
                done ?
                    <div>
                        <Alert color="failure"
                               className={error ? 'visible w-full md:max-w-md mx-auto' : 'hidden w-full md:max-w-md mx-auto '}
                               icon={IoIosAlert}>
                            {error}
                        </Alert>
                        <form className="w-full md:max-w-md mx-auto" onSubmit={updateIngredient}>
                            <div className="relative z-0 w-full mb-6 group">
                                <div className="mb-2 block">
                                    <Label htmlFor="name" value="Название"/>
                                </div>
                                <TextInput type="text"
                                           onChange={(e) => setName(e.target.value)}
                                           value={name}
                                           id="name" required/>
                            </div>
                            <div className="flex items-center gap-2  mb-4">
                                <Checkbox id="removable" checked={removable}
                                          onChange={(e) => setRemovable(!!e.currentTarget.checked)}/>
                                <Label htmlFor="removable">Можно удалять</Label>
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
                                                этот ингредиент?
                                            </h3>
                                            <div className="flex justify-center gap-4">
                                                <Button color="failure" onClick={() => deleteIngredient()}>
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

export default IngredientUpdate;