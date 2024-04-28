import React, {useEffect, useRef, useState} from 'react';
import {Alert, Spinner, Tabs, TabsRef} from "flowbite-react";
import {IoIosAlert} from "react-icons/io";
import {useParams} from "react-router-dom";
import {ProductDetails} from "../../types/models";
import {SetTabPropsType} from "../../types";
import {getBearer} from "../../utils";
import IngredientBadge from '../ingredients/IngredientBadge';

const Details = ({setTab}: SetTabPropsType) => {
    setTab(-1);

    const [done, setDone] = useState(false);
    const [error, setError] = useState("");
    const [price, setPrice] = useState("");
    const [removed, setRemoved] = useState<string[]>([]);
    const [details, setDetails] = useState<ProductDetails | null>(null);
    const {id} = useParams();
    const tabsRef = useRef<TabsRef>(null);
    const [activeTab, setActiveTab] = useState(0);


    useEffect(() => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/menu/details/${id}`, {
            method: "GET",
        }).then(async (response) => {
            if (response.status === 200) {
                setDetails(await response.json());
                setRemoved([]);
            } else {
                setError('Произошла ошибка при получении товара')
            }
        }).catch(() => {
            setError('Произошла ошибка при получении товара')
        }).finally(() => setDone(true));
    }, [id]);

    useEffect(() => {
        if (details !== null) {
            let resultPrice = details.product.small_size_price * Number(details.prices[activeTab].markup);
            setPrice(`Цена: ${resultPrice.toFixed(2)} р.`);
        }
    }, [details, activeTab]);

    const addToCart = () => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
            body: JSON.stringify({
                item_id: details?.product.id,
                item_size: activeTab + 1,
                removed: removed.join(', ')
            })
        }).then(async (res) => {
            if (res.status === 200) {
                window.location.href = '/';
            } else {
                let error_message = await res.json();
                setError(error_message.error);
            }
        }).catch(err => console.log(err))
    }

    const removeIngredient = (ingr: string) => {
        setRemoved([...removed, ingr]);
    }
    const cancelRemoveIngredient = (ingr: string) => {
        setRemoved(removed.filter(item => item !== ingr))
    }

    return (
        <div>
            <Alert color="failure"
                   className={error ? 'visible w-full md:max-w-md mx-auto' : 'hidden w-full md:max-w-md mx-auto '}
                   icon={IoIosAlert}>
                {error}
            </Alert>

            {
                done ?
                    <div>
                        {
                            details !== null ?
                                <div
                                    className="flex flex-col md:items-start items-center mx-auto mt-10 md:flex-row md:max-w-3xl">
                                    <img className="object-cover h-96 md:h-auto md:w-64 md:rounded-none md:rounded-l-lg"
                                         src={`${process.env.REACT_APP_SERVER_ADDRESS}/${details.product.item_image}`}
                                         alt={details.product.item_name}/>
                                    <div className="flex flex-col p-4 leading-normal">
                                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                            {details.product.item_name}
                                        </h5>
                                        <p className="mb-3 flex flex-wrap gap-2 text-lg font-normal text-gray-700 dark:text-white">
                                            {
                                                details.ingredients.map(ingr => <IngredientBadge name={ingr.name}
                                                                                                 cancelRemoveIngredient={cancelRemoveIngredient}
                                                                                                 removeIngredient={removeIngredient}
                                                                                                 removable={ingr.removable}
                                                                                                 removed={removed.includes(ingr.name.toLowerCase())!}/>)
                                            }
                                        </p>
                                        <h6 className="mb-2">Размер</h6>
                                        <Tabs aria-label="Pills" style="pills" className="mb-0" ref={tabsRef}
                                              onActiveTabChange={(tab) => setActiveTab(tab)}>
                                            {
                                                details.sizes.map(size =>
                                                    <Tabs.Item title={`${size.item_size} см`}>
                                                        <p className="mb-3 mt-4 text-xl font-normal dark:text-white">
                                                            {price}
                                                        </p>
                                                    </Tabs.Item>
                                                )
                                            }

                                        </Tabs>
                                        <div className="w-full md:max-w-6xl mx-auto mt-8">
                                            <button type="button" onClick={addToCart} className="cursor-pointer text-white w-fit bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm
px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                                Добавить товар в корзину
                                            </button>
                                        </div>
                                    </div>
                                </div> : <h2>Произошла ошибка</h2>
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

export default Details;