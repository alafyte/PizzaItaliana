import React from 'react';
import {Tabs} from "flowbite-react";
import {AdminPanelPropsType} from "../../types";
import {useSearchParams} from "react-router-dom";

const AdminPanel = ({setTab, adminMenu}: AdminPanelPropsType) => {
    const [searchParams] = useSearchParams();
    setTab(-1);

    return (
        <div>
            <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">Добро пожаловать в
                панель
                администратора</h2>
            <Tabs className="mx-auto" aria-label="Default tabs" onActiveTabChange={(tab) => {
                window.location.href = `?tab=${tab + 1}`;
            }}>
                {
                    adminMenu.map(tab => {
                            let tabNumber = searchParams.get("tab") ? Number(searchParams.get("tab")) : 1;
                            return (
                                <Tabs.Item active={tab.id === tabNumber} title={tab.tab_title}>
                                    {tab.component}
                                </Tabs.Item>);
                        }
                    )
                }
            </Tabs>
        </div>
    );
};

export default AdminPanel;