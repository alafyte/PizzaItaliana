import React from "react";
import {MenuComponentTab, MenuUrlTab, Paginator, User} from "./models";

export type HeaderPropsType = {
    selectedTab: number,
    user: User | null,
    setUser: React.Dispatch<React.SetStateAction<User | null>>
}

export type OrderStatusPropsType = {
    user: User | null,
}

export type LoginFormPropsType = {
    setTab:  React.Dispatch<React.SetStateAction<number>>,
    setUser: React.Dispatch<React.SetStateAction<User | null>>
}

export type AdminPanelPropsType = {
    setTab:  React.Dispatch<React.SetStateAction<number>>,
    adminMenu: MenuComponentTab[]
}

export type HeadAdminPanelPropsType = {
    setTab:  React.Dispatch<React.SetStateAction<number>>,
    adminMenu: MenuUrlTab[]
}

export type MultipleChoicePropsType = {
    id: number,
    choice: string,
    checked: boolean,
    chooseItem: (id: number) => void,
    deleteItem: (id: number) => void,
}

export type AdminMenuTabsPropsType = {
    currentTab: number,
    adminMenu: MenuUrlTab[]
}

export type SetTabPropsType = {
    setTab:  React.Dispatch<React.SetStateAction<number>>,
}

export type DisplayMenuPropsType = {
    menuUrlAction: string
}

export type ShouldBeLoggedInPropsType = {
    children: React.ReactNode,
    shouldBeLoggedIn: boolean
}

export type CheckRolePropsType = {
    children: React.ReactNode,
    userRoles: string[],
    currentUserRole: string
}

export type PaginatorPropsType = {
    paginator: Paginator,
    changePage: (page: number) => void
}

export type IngredientPropsType = {
    name: string,
    removable: boolean,
    removeIngredient: (ingr: string) => void,
    cancelRemoveIngredient: (ingr: string) => void,
    removed: boolean
}

export type SearchPropsType = {
    search: (event: React.FormEvent<HTMLFormElement>, name: string) => void
}