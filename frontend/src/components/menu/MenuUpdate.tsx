import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {getBearer} from "../../utils";
import {Ingredient, ProductUpdate} from "../../types/models";
import {Alert, Button, FileInput, Label, Modal, Spinner, TextInput} from "flowbite-react";
import {IoIosAlert} from "react-icons/io";
import {HiOutlineExclamationCircle} from "react-icons/hi";
import MultipleChoice from "../partials/MultipleChoice";

const MenuUpdate = () => {
    const {id} = useParams();
    const [openModal, setOpenModal] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [smallSizePrice, setSmallSizePrice] = useState("");
    const [availableIngredients, setAvailableIngredients] = useState<Ingredient[] | null>(null);
    let [chosenIngredients, setChosenIngredients] = useState<number[]>([]);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/menu/${id}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
        }).then(async (response) => {
            if (response.status === 200) {
                let menu: ProductUpdate = await response.json();
                setName(menu.product.item_name);
                setSmallSizePrice(menu.product.small_size_price.toString());
                setChosenIngredients(menu.ingredients);
            } else if (response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            }
        }).then(() =>
            fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/ingredient/all`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getBearer(),
                    'Access-Control-Allow-Origin': '*',
                },
                credentials: 'include',
            })
        ).then(async (response) => {
            if (response.status === 200) {
                setAvailableIngredients(await response.json());
            } else if (response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            }
        }).catch(err => console.log(err)).finally(() => setDone(true))
    }, [id]);

    const updateMenu = (e: FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('item_image', file === null ? "null" : file);
        formData.append('item_name', name);
        formData.append('small_size_price', smallSizePrice);
        formData.append('ingredients', JSON.stringify(chosenIngredients));

        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/menu/${id}`, {
            method: 'POST',
            headers: {
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
            body: formData
        }).then(async (res) => {
            if (res.status === 200) {
                window.location.href = '/admin/head/menu';
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
        }).catch(err => console.log(err))
    }

    const addIngredient = (id: number) => {
        setChosenIngredients([...chosenIngredients, id])
    }

    const removeIngredient = (id: number) => {
        setChosenIngredients(chosenIngredients.filter(item => item !== id));
    }


    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const deleteMenu = () => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/menu/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
        }).then(async (res) => {
            if (res.status === 200) {
                window.location.href = '/admin/head/menu';
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
            setError("Произошла ошибка при удалении товара");
        })
    }

    return (
        <div>
            <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">
                Изменить товар
            </h2>
            <Alert color="failure"
                   className={error ? 'visible w-full md:max-w-md mx-auto' : 'hidden w-full md:max-w-md mx-auto '}
                   icon={IoIosAlert}>
                {error}
            </Alert>
            {
                done ?
                    <form className="w-full md:max-w-md mx-auto" onSubmit={updateMenu}>
                        <div className="relative z-0 w-full mb-6 group">
                            <div className="mb-2 block">
                                <Label htmlFor="item_name" value="Название"/>
                            </div>
                            <TextInput type="text"
                                       onChange={(e) => setName(e.target.value)}
                                       value={name}
                                       id="item_name" required/>
                        </div>
                        <div className="relative z-0 w-full mb-6 group">
                            <div className="mb-2 block">
                                <Label htmlFor="price" value="Цена"/>
                            </div>
                            <TextInput type="text"
                                       onChange={(e) => setSmallSizePrice(e.target.value)}
                                       value={smallSizePrice}
                                       id="price" required/>
                        </div>
                        <div className="relative z-0 w-full mb-6 group">
                            <div className="mb-2 block">
                                <Label htmlFor="description" value="Ингредиенты"/>
                            </div>
                            <div className="h-40 grid grid-cols-2 gap-y-3 overflow-y-auto">
                                {
                                    availableIngredients?.map(ingr => <MultipleChoice deleteItem={removeIngredient}
                                                                                      id={ingr.id}
                                                                                      choice={ingr.name}
                                                                                      checked={chosenIngredients?.includes(ingr.id)!}
                                                                                      chooseItem={addIngredient}/>)
                                }
                            </div>
                        </div>
                        <div id="fileUpload" className="max-w-md">
                            <div className="mb-2 block">
                                <Label htmlFor="file" value="Изображение"/>
                            </div>
                            <FileInput id="file" onChange={handleFileChange} helperText="jpg, png файлы"/>
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
                                            этот товар?
                                        </h3>
                                        <div className="flex justify-center gap-4">
                                            <Button color="failure" onClick={() => deleteMenu()}>
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
                    :
                    <div className="text-center mt-4">
                        <Spinner aria-label="spinner" size="xl"/>
                    </div>
            }
        </div>
    );
};

export default MenuUpdate;