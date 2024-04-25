import React, {useEffect, useState} from 'react';
import {MenuComponentTab, MenuUrlTab, User, UserRoles} from "./types/models";
import Couriers from "./components/courier/Couriers";
import RestaurantByAdmin from "./components/restaurant/RestaurantByAdmin";
import ArchiveOrders from "./components/order/ArchiveOrders";
import {jwtDecode} from "jwt-decode";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Header from "./components/partials/Header";
import ShouldBeLoggedIn from "./utils/ShouldBeLoggedIn";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import Profile from "./components/auth/Profile";
import AboutUs from "./components/index/AboutUs";
import Contact from "./components/index/Contact";
import ForClient from "./components/index/ForClient";
import MapComponent from "./components/index/MapComponent";
import IndexComponent from "./components/index/IndexComponent";
import Details from "./components/menu/Details";
import UserCart from "./components/cart/UserCart";
import OrderForm from "./components/order/OrderForm";
import UserOrders from "./components/order/UserOrders";
import CheckRole from "./utils/CheckRole";
import AdminPanel from "./components/admin/AdminPanel";
import Administrators from "./components/admin/Administrators";
import Restaurants from "./components/restaurant/Restaurants";
import Menu from "./components/menu/Menu";
import Ingredients from "./components/ingredients/Ingredients";
import IngredientAdd from "./components/ingredients/IngredientAdd";
import IngredientUpdate from "./components/ingredients/IngredientUpdate";
import MenuAdd from "./components/menu/MenuAdd";
import MenuUpdate from "./components/menu/MenuUpdate";
import CourierAdd from "./components/courier/CourierAdd";
import CourierUpdate from "./components/courier/CourierUpdate";
import AdminAdd from "./components/admin/AdminAdd";
import RestaurantAdd from "./components/restaurant/RestaurantAdd";
import RestaurantUpdate from "./components/restaurant/RestaurantUpdate";
import NotFound from "./components/partials/NotFound";
import {socket} from "./components/socket/socket";
import Push from "push.js";

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [tab, setTab] = useState(1);

    const restAdminMenu: MenuComponentTab[] = [
        {id: 1, tab_title: 'Курьеры', component: <Couriers/>},
        {id: 2, tab_title: 'Ресторан', component: <RestaurantByAdmin/>},
        {id: 3, tab_title: 'Архив', component: <ArchiveOrders/>},
    ]

    const headAdminMenu: MenuUrlTab[] = [
        {id: 1, tab_title: 'Администраторы ресторанов', tab_url: "/admin/head/admins"},
        {id: 2, tab_title: 'Рестораны', tab_url: "/admin/head/restaurants"},
        {id: 3, tab_title: 'Управление меню', tab_url: "/admin/head/menu"},
        {id: 4, tab_title: 'Ингредиенты блюд', tab_url: "/admin/head/ingredients"},
    ]


    useEffect(() => {
        let token = localStorage.getItem('token');
        if (token !== null) {
            setUser(jwtDecode(token));
        } else {
            setUser(null);
        }
        socket.emit('setClientId', user?.id);

        socket.on('orderStatusChanged', data => {
            Push.create('Статус заказа изменился', {
                body: `Новый статус заказа №${data.orderId}: ${data.status.toLowerCase()}`,
                icon: '/favicon.png'
            })
        });

        socket.on('newOrderAdmin', () => {
            Push.create('Новый заказ!', {
                body: 'Поступил новый заказ',
                icon: '/favicon.png'
            })
        });

        return () => {
            socket.off('orderStatusChanged');
            socket.off('newOrderAdmin');
        };

    }, [user?.id]);

    return (
        <BrowserRouter>
            <Header selectedTab={tab} user={user} setUser={setUser}/>
            <Routes>
                <Route path='/users/login' element={
                    <ShouldBeLoggedIn shouldBeLoggedIn={false}>
                        <LoginForm setTab={setTab} setUser={setUser}/>
                    </ShouldBeLoggedIn>
                }/>
                <Route path='/users/registration' element={
                    <ShouldBeLoggedIn shouldBeLoggedIn={false}>
                        <RegisterForm setTab={setTab}/>
                    </ShouldBeLoggedIn>
                }/>
                <Route path='/users/profile' element={
                    <ShouldBeLoggedIn shouldBeLoggedIn={true}>
                        <Profile setTab={setTab} setUser={setUser}/>
                    </ShouldBeLoggedIn>
                }/>
                <Route path='/about' element={<AboutUs setTab={setTab}/>}/>
                <Route path='/contact' element={<Contact setTab={setTab}/>}/>
                <Route path='/rules' element={<ForClient setTab={setTab}/>}/>
                <Route path='/map' element={<MapComponent/>}/>
                <Route path='/' element={<IndexComponent/>}/>
                <Route path='/menu/details/:id' element={<Details setTab={setTab}/>}/>
                <Route path='/cart' element={<UserCart setTab={setTab}/>}/>
                <Route path='/order/make-order' element={<OrderForm setTab={setTab}/>}/>
                <Route path='/order' element={<UserOrders setTab={setTab}/>}/>

                {
                    user !== null ?
                        <>
                            <Route path='/admin' element={
                                <CheckRole userRoles={[UserRoles.RESTAURANT_ADMIN]}
                                           currentUserRole={user.user_role_rel.role_name}>
                                    <AdminPanel setTab={setTab} adminMenu={restAdminMenu}/>
                                </CheckRole>
                            }/>
                            <Route path='/admin/head/admins' element={
                                <CheckRole userRoles={[UserRoles.HEAD_ADMIN]}
                                           currentUserRole={user.user_role_rel.role_name}>
                                    <Administrators setTab={setTab} adminMenu={headAdminMenu}/>
                                </CheckRole>
                            }/>
                            <Route path='/admin/head/restaurants' element={
                                <CheckRole userRoles={[UserRoles.HEAD_ADMIN]}
                                           currentUserRole={user.user_role_rel.role_name}>
                                    <Restaurants setTab={setTab} adminMenu={headAdminMenu}/>
                                </CheckRole>
                            }/>
                            <Route path='/admin/head/menu' element={
                                <CheckRole userRoles={[UserRoles.HEAD_ADMIN]}
                                           currentUserRole={user.user_role_rel.role_name}>
                                    <Menu setTab={setTab} adminMenu={headAdminMenu}/>
                                </CheckRole>
                            }/>
                            <Route path='/admin/head/ingredients' element={
                                <CheckRole userRoles={[UserRoles.HEAD_ADMIN]}
                                           currentUserRole={user.user_role_rel.role_name}>
                                    <Ingredients setTab={setTab} adminMenu={headAdminMenu}/>
                                </CheckRole>
                            }/>
                            <Route path='/ingredient/add' element={
                                <CheckRole userRoles={[UserRoles.HEAD_ADMIN]}
                                           currentUserRole={user.user_role_rel.role_name}>
                                    <IngredientAdd/>
                                </CheckRole>
                            }/>
                            <Route path='/ingredients/update/:id' element={
                                <CheckRole userRoles={[UserRoles.HEAD_ADMIN]}
                                           currentUserRole={user.user_role_rel.role_name}>
                                    <IngredientUpdate/>
                                </CheckRole>
                            }/>
                            <Route path='/menu/add' element={
                                <CheckRole userRoles={[UserRoles.HEAD_ADMIN]}
                                           currentUserRole={user.user_role_rel.role_name}>
                                    <MenuAdd/>
                                </CheckRole>
                            }/>
                            <Route path='/menu/update/:id' element={
                                <CheckRole userRoles={[UserRoles.HEAD_ADMIN]}
                                           currentUserRole={user.user_role_rel.role_name}>
                                    <MenuUpdate/>
                                </CheckRole>
                            }/>
                            <Route path='/couriers/add' element={
                                <CheckRole userRoles={[UserRoles.RESTAURANT_ADMIN]}
                                           currentUserRole={user.user_role_rel.role_name}>
                                    <CourierAdd/>
                                </CheckRole>
                            }/>
                            <Route path='/couriers/update/:id' element={
                                <CheckRole userRoles={[UserRoles.RESTAURANT_ADMIN]}
                                           currentUserRole={user.user_role_rel.role_name}>
                                    <CourierUpdate/>
                                </CheckRole>
                            }/>
                            <Route path='/admin/add' element={
                                <CheckRole userRoles={[UserRoles.HEAD_ADMIN]}
                                           currentUserRole={user.user_role_rel.role_name}>
                                    <AdminAdd/>
                                </CheckRole>
                            }/>
                            <Route path='/restaurants/add' element={
                                <CheckRole userRoles={[UserRoles.HEAD_ADMIN]}
                                           currentUserRole={user.user_role_rel.role_name}>
                                    <RestaurantAdd/>
                                </CheckRole>
                            }/>
                            <Route path='/restaurants/update/:id' element={
                                <CheckRole userRoles={[UserRoles.HEAD_ADMIN]}
                                           currentUserRole={user.user_role_rel.role_name}>
                                    <RestaurantUpdate/>
                                </CheckRole>
                            }/>
                        </>
                        :
                        <></>
                }
                <Route path='*' element={<NotFound/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
