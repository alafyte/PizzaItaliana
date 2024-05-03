import React, {useState} from 'react';
import {getBearer} from "../../utils";
import {Alert, Button, Checkbox, Label, TextInput} from "flowbite-react";
import {IoIosAlert} from "react-icons/io";

const IngredientAdd = () => {
    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [removable, setRemovable] = useState(false);
    const addIngredient = (event: React.FormEvent) => {
        event.preventDefault();

        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/ingredient`, {
            method: 'POST',
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
            }
            else {
                let error_message = await res.json();
                let error_text = "";
                for (let message of error_message.error) {
                    error_text += `${message.msg}\n`;
                }
                setError(error_text);
            }
        }).catch(() => {
            setError("Произошла ошибка при добавлении ингредиента");
        })
    }

    return (
        <div>
            <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">
                Добавить ингредиент
            </h2>

            <Alert color="failure" className={error ? 'visible w-full md:max-w-md mx-auto' : 'hidden w-full md:max-w-md mx-auto '} icon={IoIosAlert}>
                {error}
            </Alert>
            <form className="w-full md:max-w-md mx-auto" onSubmit={addIngredient}>
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
                <Button className="mx-auto" type="submit">Добавить</Button>
            </form>
        </div>
    );
};

export default IngredientAdd;