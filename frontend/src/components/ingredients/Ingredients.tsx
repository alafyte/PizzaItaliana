import React, {useEffect, useState} from 'react';
import {HeadAdminPanelPropsType} from "../../types";
import AdminMenuTabs from "../admin/AdminMenuTabs";
import {getBearer} from "../../utils";
import {IngredientsPaginator} from "../../types/models";
import {Spinner, Table} from "flowbite-react";
import Paginator from "../partials/Paginator";
import {useSearchParams} from "react-router-dom";

const Ingredients = ({setTab, adminMenu}: HeadAdminPanelPropsType) => {
    setTab(-1);

    const [searchParams, setSearchParams] = useSearchParams();
    const [done, setDone] = useState(false);
    const [ingredientsPaginator, setIngredientsPaginator] = useState<IngredientsPaginator | null>(null);

    useEffect(() => {
        let page = searchParams.get("page");
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/ingredient?page=${page}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getBearer(),
                'Access-Control-Allow-Origin': '*',
            },
            credentials: 'include',
        }).then(async (response) => {
            if (response.status === 200) {
                setIngredientsPaginator(await response.json());
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
            <AdminMenuTabs currentTab={4} adminMenu={adminMenu}/>
            {
                done ?
                    <div>
                        <div className="w-full md:max-w-6xl mx-auto mt-8 mb-8">
                            <a href="/ingredient/add" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm
px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                Добавить ингредиент
                            </a>
                        </div>
                        <div className="overflow-x-auto w-full md:max-w-md mx-auto">
                            {
                                ingredientsPaginator !== null && ingredientsPaginator.objects.length !== 0 ?
                                    <div>
                                        <Table>
                                            <Table.Head>
                                                <Table.HeadCell>ID</Table.HeadCell>
                                                <Table.HeadCell>Название</Table.HeadCell>
                                                <Table.HeadCell>Можно удалять</Table.HeadCell>
                                            </Table.Head>
                                            <Table.Body className="divide-y">
                                                {
                                                    ingredientsPaginator.objects.map(ingr => {
                                                        return (<Table.Row
                                                            className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                                            <Table.Cell
                                                                className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                                {ingr.id}
                                                            </Table.Cell>
                                                            <Table.Cell> <a
                                                                href={`/ingredients/update/${ingr.id}`}>{ingr.name}</a></Table.Cell>
                                                            <Table.Cell>{ingr.removable ? 'Да' : 'Нет'}</Table.Cell>
                                                        </Table.Row>)
                                                    })
                                                }
                                            </Table.Body>
                                        </Table>
                                        <Paginator paginator={ingredientsPaginator.paginator} changePage={changePage}/>
                                    </div>
                                    :
                                    <h2 className="lg:text-4xl text-3xl text-black font-extrabold dark:text-white text-center mb-8">
                                        Ингредиенты не найдены
                                    </h2>
                            }
                        </div>
                    </div>
                    :
                    <div className="text-center mt-4">
                        <Spinner aria-label="spinner" size="xl"/>
                    </div>
            }
        </div>
    );
};

export default Ingredients;