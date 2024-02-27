import { Prisma } from '@prisma/client'

export enum UserRoles {
    HEAD_ADMIN = 1,
    RESTAURANT_ADMIN,
    USER,
    COURIER
}

export enum OrderStatus {
    IN_PROGRESS = "В работе",
    READY = "Готов",
    DELIVERING = "Доставляется",
    DONE = "Завершён"
}

export type Restaurant = {
    id?: number,
    address: string | null,
    location: string | null,
    coverage_area: string | null,
    admin: number | null,
    open_time: string | null,
    close_time: string | null,
    delivery_start_time: string | null,
    delivery_end_time: string | null,
}

export type CartItemType = {
    cart_id: number,
    menu_item_id: number,
    menu_item_size: number
}

export type Product = {
    id: number,
    item_name: string,
    small_size_price: Prisma.Decimal,
    description : string | null,
    item_image : string | null
}

export type CreateOrderType = {
    user_latitude: number,
    user_longitude: number,
    user_id: number,
    address: string,
    cart_id: number
}

export type FindNearestResultType = {
    find_nearest_restaurant: string
}

export type FeatureType = {
    type: string,
    geometry: object
}

export type FeatureCollectionType = {
    type: string,
    features: FeatureType[]
}