import React from 'react';
import {HeadAdminPanelPropsType} from "../../types";
import AdminMenuTabs from "../admin/AdminMenuTabs";
import DisplayMenu from "./DisplayMenu";

const Menu = ({setTab, adminMenu}: HeadAdminPanelPropsType) => {
    setTab(-1);

    return (
        <div>
            <AdminMenuTabs currentTab={3} adminMenu={adminMenu}/>
            <div className="w-full md:max-w-6xl mx-auto mt-8">
                <a href="/menu/add" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm
px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                    Добавить товар
                </a>
            </div>

            <DisplayMenu menuUrlAction={"update"}/>
        </div>
    );
};

export default Menu;