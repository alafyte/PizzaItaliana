import {Request, Response} from 'express';
import {PrismaClient} from "@prisma/client";
import {CreateOrderType, OrderStatus} from "../types";
import {getAllObjectsPage} from "../utils";

const prisma = new PrismaClient();
const getUserOrders = async (req: Request, res: Response) => {
    try {
        let pageQuery: string = req.query.page ? req.query.page.toString() : "1";

        let page: number;
        if (!parseInt(pageQuery, 10)) {
            page = 1;
        } else {
            page = parseInt(pageQuery, 10);
        }

        let orders = await prisma.user_order.findMany({
            where: {user_id: req.session!.user.id},
            orderBy: [{date_of_order: 'desc'}],
            select: {
                id: true,
                date_of_order: true,
                address: true,
                status: true,
                order_items: {
                    select: {
                        id: true,
                        menu_item_info: {
                            select: {
                                menu: true,
                                size_category: true
                            }
                        },
                        item_quantity: true,
                        item_total_price: true
                    }
                }
            }
        });

        for (let order of orders) {
            let result_cost = 0;
            order.order_items.forEach(o => result_cost += Number(o.item_total_price));
            //@ts-ignore
            order.total_price = result_cost.toFixed(2);
        }

        let result = await getAllObjectsPage(orders, page, 3);

        res.status(200).json(result)
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при получении заказов"}]})
    }
}

const makeOrder = async (req: Request, res: Response) => {
    try {
        let cart = await prisma.cart.findFirst({
            where: {user_id: req.session!.user.id}
        });

        if (cart === null) {
            return res.status(422).json({error: [{msg: "Ошибка при совершении заказа"}]})
        }

        let new_data: CreateOrderType = {
            user_latitude: req.body.latitude,
            user_longitude: req.body.longitude,
            user_id: req.session!.user.id,
            address: req.body.address,
            cart_id: cart.id
        }

        createOrderQuery(new_data)
            .then(() => res.status(200).json({message: "success"}))
            .catch((err: any) => {
                const messages = [
                    "Пользователь вне области доставки",
                    "Время заказа не входит в промежуток работы службы доставки",
                    "Нет свободных курьеров"
                ]
                let error_message = "Ошибка при оформлении заказа";
                if (err.message.includes(messages[0])) {
                    error_message = "Указанный адрес не входит в область доставки"
                } else if (err.message.includes(messages[1])) {
                    error_message = messages[1]
                } else if (err.message.includes(messages[2])) {
                    error_message = "На данный момент сервис доставки перегружен. Повторите попытку позже"
                }
                return res.status(422).json({error: error_message})
            });
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при совершении заказа"}]})
    }
}

const changeOrderStatus = async (req: Request, res: Response) => {
    try {
        if (!parseInt(req.params['orderId'], 10)) {
            res.status(422).json({error: "Неверный идентификатор заказа"})
        }
        let id = parseInt(req.params['orderId'], 10);

        let newOrder = await prisma.user_order.update({
            where: {id: id},
            data: {
                status: req.body.status
            }
        });

        if (req.body.status === OrderStatus.DONE) {
            await prisma.courier.update({
                where: {id: newOrder.courier_id},
                data: {
                    busy: false
                }
            })
        }

        return res.status(200).json({message: "success"});
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при обновлении статуса заказа"}]})
    }
}



const createOrderQuery = async (new_data: CreateOrderType) => {
    let query = `SELECT * FROM
        public.MOVE_CART_ITEMS_TO_ORDER(
        ${new_data.user_latitude}, 
        ${new_data.user_longitude},
        ${new_data.user_id},
        '${new_data.address}'::text,
        ${new_data.cart_id});`;

    return prisma.$executeRawUnsafe(query);
}

export default {
    getUserOrders: getUserOrders,
    makeOrder: makeOrder,
    changeOrderStatus: changeOrderStatus
}


