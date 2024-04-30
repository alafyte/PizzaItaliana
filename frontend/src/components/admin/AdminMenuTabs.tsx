import React from 'react';
import {AdminMenuTabsPropsType} from "../../types";

const AdminMenuTabs = ({currentTab, adminMenu} : AdminMenuTabsPropsType) => {
    return (
        <div>
            <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">Добро пожаловать в
                панель
                администратора</h2>
            <ul className="flex w-full md:max-w-max mx-auto flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
                {
                    adminMenu.map(tab => {
                        if (tab.id === currentTab) {
                            return (<li className="me-2">
                                <a href={tab.tab_url} aria-current="page"
                                   className="inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500">{tab.tab_title}</a>
                            </li>)
                        } else {
                            return (
                                <li className="me-2">
                                    <a href={tab.tab_url}
                                       className="inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300">{tab.tab_title}</a>
                                </li>
                            )
                        }
                    })
                }
            </ul>
        </div>
    );
};

export default AdminMenuTabs;