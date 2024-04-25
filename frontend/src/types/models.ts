import {ReactNode} from "react";

export type Restaurant = {
    id: number,
    address: string,
    restaurant_admin?: string,
    open_time: string,
    close_time: string,
    delivery_start_time: string,
    delivery_end_time: string,
}

export type User = {
    exp: number,
    iat: number,
    id: number,
    personal_data: number,
    personal_data_rel: PersonalDataType,
    user_role: number,
    user_role_rel: UserRoleType
}

export type PersonalDataType = {
    id?: number,
    full_name: string,
    email: string,
    phone_number: string,
    date_of_birth: string
}

type UserRoleType = {
    id: number,
    role_name: string
}

export enum UserRoles {
    HEAD_ADMIN = 'head_admin',
    RESTAURANT_ADMIN = 'restaurant_admin',
    USER = 'user'
}

export type Product = {
    id: number,
    item_name: string,
    small_size_price: number,
    item_image: string,
}

export type SizeCategory = {
    id: number,
    item_size: string
    markup?: string
}


export type PriceCategory = {
    id: number,
    markup: string
}

export type ProductDetails = {
    product: Product,
    sizes: SizeCategory[],
    prices: PriceCategory[],
    ingredients: Ingredient[]
}

export type ProductUpdate = {
    product: Product,
    ingredients: number[]
}

export type ProductsPaginator = {
    objects: Product[],
    paginator: Paginator
}

export type IngredientsPaginator = {
    objects: Ingredient[],
    paginator: Paginator
}

export type OrdersPaginator = {
    objects: Order[],
    paginator: Paginator
}

export type Paginator = {
    pagesCount: number,
    currentPage: number,
    hasOtherPages: boolean,
    hasNext: boolean,
    nextPageNumber: number,
    hasPrevious: boolean,
    previousPageNumber: number,
    pageRange: number[]
}

export type Cart = {
    cart_items: CartItem[],
    result_price: number
}

export type CartItem = {
    id: number,
    item_quantity: number,
    menu_item_info: MenuItemInfo,
    notes: string | null,
    current_price: number
}

export type MenuItemInfo = {
    menu: Product,
    size_category: SizeCategory
}

export type Order = {
    id: number,
    date_of_order: string,
    address: string,
    status: string,
    app_user?: UserRelation,
    order_items: OrderItem[],
    total_price: string
}

export type Ingredient = {
    id: number,
    name: string,
    removable: boolean
}

export type OrderItem = {
    id: number,
    menu_item_info: MenuItemInfo,
    item_quantity: number,
    item_total_price: string,
    notes: string | null
}

export type Admin = {
    id: number,
    restaurant: RestaurantRel | null,
    personal_data_rel: PersonalDataType
}

export type UnassignedAdmin = {
    id: number,
    personal_data_rel: PersonalDataRel
}

export type Courier = {
    id: number,
    salary: number,
    active: boolean,
    busy: boolean,
    restaurant_rel: RestaurantRelation,
    personal_data_rel: PersonalDataType,
    current_order_id?: number
}

export type RestaurantForChange = {
    restaurant: Restaurant,
    current_admin: UnassignedAdmin,
    admins: UnassignedAdmin[]
}

export type RestaurantRelation = {
    restaurant_admin: number
}

export type UserRelation = {
    id?: number,
    personal_data_rel: PersonalDataRel
}

export type RestaurantByAdminType = {
    restaurant: Restaurant,
    paginator: OrdersPaginator
}

export type MenuComponentTab = {
    id: number,
    tab_title: string,
    component: ReactNode
}

export type MenuUrlTab = {
    id: number,
    tab_title: string,
    tab_url: string
}

export type PersonalDataRel = {
    full_name: string,
    phone_number?: string
}

export type RestaurantRel = {
    address: string
}