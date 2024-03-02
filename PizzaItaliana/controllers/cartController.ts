import {Request, Response} from 'express';
import {PrismaClient} from "@prisma/client";
import {CartItemType} from "../types";

const prisma = new PrismaClient();

const getUserCartInfo = async (req: Request, res: Response) => {
    try {
        let cart = await prisma.cart.findFirst({
            where: {user_id: req.session!.user.id},
            select: {id: true}
        });

        let cart_items = await prisma.cart_item.findMany({
            where: {cart_id: cart!.id},
            select: {
                id: true,
                item_quantity: true,
                menu_item_info: {
                    select: {
                        menu: true,
                        size_category: true
                    }
                }
            }
        })

        let result_price = 0;
        for (let item of cart_items) {
            // @ts-ignore
            item.current_price = String((item.menu_item_info.menu.small_size_price * item.menu_item_info.size_category.markup * item.item_quantity).toFixed(2));
            // @ts-ignore
            result_price += +item.current_price;
        }

        res.status(200).json({
            cart_items: cart_items,
            result_price: result_price.toFixed(2)
        })
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при отображении корзины"}]})
    }
}

const addToCart = async (req: Request, res: Response) => {
    try {
        let cart = await prisma.cart.findFirst({
            where: {user_id: req.session!.user.id}
        });

        if (cart === null) {
            return res.status(422).json({error: "Ошибка добавлении товара"})
        }

        const new_data = {
            cart_id: cart.id,
            menu_item_id: req.body.item_id,
            menu_item_size: req.body.item_size,
        }

        addToCartQuery(new_data)
            .then(() => res.status(200).json({message: "success"}))
            .catch(() => res.status(422).json({error: "Общее кол-во товаров в корзине не должно превышать 10 шт."}));

    } catch (err) {
        return res.status(422).json({error: "Ошибка при добавлении товара в корзину"});
    }
}

const changeQuantity = async (req: Request, res: Response) => {
    try {
        if (!parseInt(req.params['itemId'], 10)) {
            res.status(422).json({error: "Неверный идентификатор товара"})
        }
        let id = parseInt(req.params['itemId'], 10);

        await updateQuantityQuery(id, req.body.count)
            .then(() => res.status(200).json({message: "success"}))
            .catch(() => res.status(422).json({error: "Общее кол-во товаров в корзине не должно превышать 10 шт."}));
    } catch (err) {
        return res.status(422).json({error: "Произошла ошибка при изменении количества."});
    }
}

const deleteItemFromCart = async (req: Request, res: Response) => {
    try {
        if (!parseInt(req.params['itemId'], 10)) {
            res.status(422).json({error: "Неверный идентификатор товара"})
        }
        let id = parseInt(req.params['itemId'], 10);

        await prisma.cart_item.delete({
            where: {
                id: id
            },
            select: {
                menu_item_info: true
            }
        })

        return res.status(200).json({message: "success"});
    } catch (err) {
        return res.status(422).json({error: "Ошибка при удалении товара из корзины"});
    }

}

const purgeCart = async (req: Request, res: Response) => {
    try {
        let cart = await prisma.cart.findFirst({
            where: {
                user_id: req.session!.user.id
            }
        });

        if (cart === null) {
            return res.status(422).json({error: "Ошибка при очистке корзины"})
        }

        await prisma.cart_item.deleteMany({
            where: {cart_id: cart.id}
        });

        return res.status(200).json({message: "success"});

    } catch (err) {
        return res.status(422).json({error: "Ошибка при очистке корзины"})
    }
}

const addToCartQuery = async (new_data: CartItemType) => {
    let query = `SELECT * FROM
        public.add_to_cart(
        ${new_data.cart_id}, 
        ${new_data.menu_item_id},
        ${new_data.menu_item_size});`;

    return prisma.$executeRawUnsafe(`${query}`);
}

const updateQuantityQuery = async (cart_item_id: number, new_quantity: number) => {
    let query = `SELECT * FROM
        public.update_cart_item_quantity(
        ${cart_item_id}, 
        ${new_quantity});`;

    return prisma.$executeRawUnsafe(`${query}`);
}

export default {
    getUserCartInfo: getUserCartInfo,
    addToCart: addToCart,
    changeQuantity: changeQuantity,
    deleteItemFromCart: deleteItemFromCart,
    purgeCart: purgeCart
}