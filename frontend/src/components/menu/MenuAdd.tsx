import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import {Alert, Button, FileInput, Label, Spinner, TextInput} from "flowbite-react";
import {IoIosAlert} from "react-icons/io";
import {getBearer} from "../../utils";
import MultipleChoice from "../partials/MultipleChoice";
import {Ingredient} from "../../types/models";

const MenuAdd = () => {

    const [done, setDone] = useState(false);
    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [smallSizePrice, setSmallSizePrice] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [ingredients, setIngredients] = useState<Ingredient[] | null>(null);
    let [chosenIngredients, setChosenIngredients] = useState<number[]>([]);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/ingredient/all`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
        }).then(async (response) => {
            if (response.status === 200) {
                setIngredients(await response.json());
            } else if (response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            }
        }).catch(err => console.log(err)).finally(() => setDone(true));
    }, []);


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

    const addMenu = (e: FormEvent) => {
        e.preventDefault();

        if (!file) {
            console.error('Файл не выбран');
            return;
        }

        const formData = new FormData();
        formData.append('item_image', file);
        formData.append('item_name', name);
        formData.append('small_size_price', smallSizePrice);
        formData.append('ingredients', JSON.stringify(chosenIngredients));

        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/menu`, {
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

    return (
        <div>
            <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">
                Добавить товар
            </h2>
            <Alert color="failure"
                   className={error ? 'visible w-full md:max-w-md mx-auto' : 'hidden w-full md:max-w-md mx-auto '}
                   icon={IoIosAlert}>
                {error}
            </Alert>
            {
                done ?
                    <form className="w-full md:max-w-md mx-auto" onSubmit={addMenu}>
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
                                    ingredients?.map(ingr => <MultipleChoice deleteItem={removeIngredient} id={ingr.id}
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
                            <FileInput id="file" onChange={handleFileChange} required helperText="jpg, png файлы"/>
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

export default MenuAdd;