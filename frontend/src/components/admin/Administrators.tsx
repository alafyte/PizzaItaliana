import React, {useEffect, useState} from 'react';
import {formatDate, getBearer} from "../../utils";
import {Admin} from "../../types/models";
import {Spinner, Table} from "flowbite-react";
import {HeadAdminPanelPropsType} from "../../types";
import AdminMenuTabs from "./AdminMenuTabs";

const Administrators = ({setTab, adminMenu}: HeadAdminPanelPropsType) => {
    setTab(-1);

    const [done, setDone] = useState(false);
    const [admins, setAdmins] = useState<Admin[] | null>(null);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/admin`, {
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

    return (
        <div>
            <AdminMenuTabs currentTab={1} adminMenu={adminMenu}/>
            {
                done ?
                    <div>
                        <div className="w-full md:max-w-6xl mx-auto mt-8 mb-8">
                            <a href="/admin/add" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm
px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                Добавить администратора
                            </a>
                        </div>
                        <div className="overflow-x-auto w-full md:max-w-7xl mx-auto">
                            {
                                admins !== null ?
                                    <Table>
                                        <Table.Head>
                                            <Table.HeadCell>ID</Table.HeadCell>
                                            <Table.HeadCell>ФИО</Table.HeadCell>
                                            <Table.HeadCell>Email</Table.HeadCell>
                                            <Table.HeadCell>Телефон</Table.HeadCell>
                                            <Table.HeadCell>Дата рождения</Table.HeadCell>
                                            <Table.HeadCell>Ресторан</Table.HeadCell>
                                        </Table.Head>
                                        <Table.Body className="divide-y">
                                            {
                                                admins.map(admin => {
                                                    return (<Table.Row
                                                        className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                                        <Table.Cell
                                                            className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                            {admin.id}
                                                        </Table.Cell>
                                                        <Table.Cell>{admin.personal_data_rel.full_name}</Table.Cell>
                                                        <Table.Cell>{admin.personal_data_rel.email}</Table.Cell>
                                                        <Table.Cell>{admin.personal_data_rel.phone_number}</Table.Cell>
                                                        <Table.Cell>{formatDate(new Date(admin.personal_data_rel.date_of_birth))}</Table.Cell>
                                                        <Table.Cell>{admin.restaurant !== null ? admin.restaurant.address : "-"}</Table.Cell>
                                                    </Table.Row>)
                                                })
                                            }
                                        </Table.Body>
                                    </Table>
                                    :
                                    <h2 className="lg:text-4xl text-3xl text-black font-extrabold dark:text-white text-center mb-8">
                                        Администраторы не найдены
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

export default Administrators;