import React, {useEffect, useState} from 'react';
import {ProductsPaginator} from "../../types/models";
import {DisplayMenuPropsType} from "../../types";
import {Spinner} from "flowbite-react";
import Paginator from "../partials/Paginator";
import {useSearchParams} from "react-router-dom";
import Search from "../index/Search";

const DisplayMenu = ({menuUrlAction}: DisplayMenuPropsType) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [productsPaginator, setProductsPaginator] = useState<ProductsPaginator | null>(null);
    const [done, setDone] = useState(false);

    useEffect(() => {
        let page = searchParams.get("page");
        page = page === null ? "1" : page;
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/menu?page=${page}`, {
            method: 'GET'
        }).then(async (response) => {
            if (response.status === 200) {
                setProductsPaginator(await response.json());
            }
        }).catch(err => console.log(err)).finally(() => setDone(true));
    }, [searchParams]);

    const changePage = (page: number) => {
        setSearchParams({page: page.toString()});
    }

    const searchMenu = (event: React.FormEvent<HTMLFormElement>, name: string) => {
        event.preventDefault();

        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/menu/search?name=${name}`, {
            method: 'GET'
        }).then(async (response) => {
            if (response.status === 200) {
                setProductsPaginator(await response.json());
            }
        }).catch(err => console.log(err)).finally(() => setDone(true));
    }

    return (
        <div>
            {
                done ?
                    <div>
                        {
                            productsPaginator !== null && productsPaginator.objects.length !== 0 ?
                                <main>
                                    <Search search={searchMenu}/>
                                    <div
                                        className="md:max-w-xl mt-8 lg:max-w-7xl md:mx-auto w-full px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {
                                            productsPaginator.objects.map(product =>
                                                <a href={`/menu/${menuUrlAction}/${product.id}`} className="w-full cursor-pointer max-w-sm
                                bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                                    <img className="p-8 rounded-t-lg"
                                                         src={`${process.env.REACT_APP_SERVER_ADDRESS}/${product.item_image}`}
                                                         alt={product.item_name}/>
                                                    <div className="px-5 pb-5 text-center">
                                                        <h5 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                                                            {product.item_name}
                                                        </h5>
                                                        <p className="text-xl  text-gray-900 dark:text-white">
                                                            от {product.small_size_price} р.
                                                        </p>
                                                    </div>
                                                </a>
                                            )
                                        }
                                    </div>
                                    <Paginator paginator={productsPaginator.paginator} changePage={changePage}/>
                                </main>
                                :
                                <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">
                                    Товары не найдены
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

export default DisplayMenu;