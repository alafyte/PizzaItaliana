import React from 'react';
import {HeaderPropsType} from "../../types";
import {Avatar, Dropdown, Navbar} from "flowbite-react";
import logo from '../../files/pizza-svgrepo-com.svg';
import userLogo from '../../files/user1.png';
import {UserRoles} from "../../types/models";

const Header = ({selectedTab, user, setUser}: HeaderPropsType) => {

    const auth_menu = [
        {id: 5, tab_title: 'Войти', url: '/users/login'},
        {id: 6, tab_title: 'Регистрация', url: '/users/registration'},
    ]

    const main_menu = [
        {id: 1, tab_title: 'Главная', url: '/'},
        {id: 2, tab_title: 'О нас', url: '/about'},
        {id: 3, tab_title: 'Контакты', url: '/contact'},
        {id: 4, tab_title: 'Клиенту', url: '/rules'},
    ];

    const logoutRequest = () => {
        fetch(`${process.env.REACT_APP_SERVER_ADDRESS}/auth/logout`, {
            method: 'GET',
            headers: {
                authorization: 'Bearer ' + localStorage.getItem('token')
            }
        }).then(() => {
            localStorage.removeItem('token');
            setUser(null);
            window.location.href = '/users/login';
        }).catch((err) => console.log(err));
    }

    return (
        <Navbar fluid rounded className="max-w-7xl mx-auto">
            <Navbar.Brand>
                <a href="/" className="flex items-center">
                    <img src={logo}
                         className="mr-3 h-6 sm:h-9" alt="Restaurant Logo"/>
                    <span
                        className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Pizza Italiana</span>
                </a>
            </Navbar.Brand>
            <div className="flex md:order-2">
                {
                    user !== null ?
                        <Dropdown
                            arrowIcon={false}
                            inline
                            label={
                                <Avatar alt="User settings"
                                        img={userLogo} rounded/>
                            }
                        >
                            <Dropdown.Header>
                                <span className="block text-sm text-gray-900">{user?.personal_data_rel.full_name}</span>
                                <span
                                    className="block truncate text-sm text-gray-500 font-medium">{user?.personal_data_rel.email}</span>
                            </Dropdown.Header>

                            {
                                user.user_role_rel.role_name === UserRoles.HEAD_ADMIN ?
                                    <Dropdown.Item>
                                        <a href="/admin/head/admins">Администрирование</a>
                                    </Dropdown.Item> : <></>
                            }

                            {
                                user.user_role_rel.role_name === UserRoles.RESTAURANT_ADMIN ?
                                    <Dropdown.Item>
                                        <a href="/admin">Администрирование ресторана</a>
                                    </Dropdown.Item> : <></>
                            }

                            <Dropdown.Item>
                                <a href="/users/profile">Личный кабинет</a>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <a href="/cart">Корзина</a>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <a href="/order">Мои заказы</a>
                            </Dropdown.Item>
                            <Dropdown.Item onClick={logoutRequest}>
                                Выйти
                            </Dropdown.Item>
                        </Dropdown> : <></>
                }
                <Navbar.Toggle/>
            </div>
            <Navbar.Collapse>
                {
                    main_menu.map((tab) => {
                        if (tab.id === selectedTab) {
                            return (<Navbar.Link className="font-medium text-gray-900 text-base" href={tab.url}
                                                 active>{tab.tab_title}</Navbar.Link>)
                        } else {
                            return (<Navbar.Link className="font-medium text-gray-900 text-base"
                                                 href={tab.url}>{tab.tab_title}</Navbar.Link>)
                        }
                    })
                }
                {
                    user === null ?
                        auth_menu.map((tab) => {
                            if (tab.id === selectedTab) {
                                return (<Navbar.Link className="font-medium text-gray-900 text-base" href={tab.url}
                                                     active>{tab.tab_title}</Navbar.Link>)
                            } else {
                                return (<Navbar.Link className="font-medium text-gray-900 text-base"
                                                     href={tab.url}>{tab.tab_title}</Navbar.Link>)
                            }
                        }) : <></>
                }
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Header;