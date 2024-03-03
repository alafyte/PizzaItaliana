import {validationResult} from "express-validator";
import {Request, Response} from 'express';
import {PrismaClient} from "@prisma/client";
import {stringToDate, findClosestDateObject} from "../utils";

const prisma = new PrismaClient();

const getAll = async (req: Request, res: Response) => {
    try {
        let couriers = await prisma.courier.findMany({
            where: {
                restaurant_rel: {
                    restaurant_admin: req.session!.user.id
                }
            },
            orderBy: [{personal_data_rel : {full_name: 'asc'}}],
            select: {
                id: true,
                salary: true,
                active: true,
                busy: true,
                restaurant_rel: {
                    select: {restaurant_admin: true}
                },
                user_orders: {
                    select: {
                        id: true,
                        date_of_order: true
                    }
                },
                personal_data_rel: {
                    select: {
                        full_name: true,
                        email: true,
                        phone_number: true,
                        date_of_birth: true
                    }
                }
            }
        });

        for (let courier of couriers) {
            if (courier.busy) {
                //@ts-ignore
                courier.current_order_id = findClosestDateObject(courier.user_orders);
            }
        }

        res.status(200).json(couriers);
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при отображении курьеров"}]})
    }
}

const getOne = async (req: Request, res: Response) => {
    if (!parseInt(req.params['courierId'], 10)) {
        return res.status(422).json({error: [{msg: "Неверный идентификатор курьера"}]})
    }

    let id: number = parseInt(req.params['courierId'], 10);

    try {
        let courier = await prisma.courier.findUnique({
            where: {id: id},
            select: {
                id: true,
                salary: true,
                active: true,
                busy: true,
                restaurant_rel: {
                    select: {restaurant_admin: true}
                },
                personal_data_rel: {
                    select: {
                        full_name: true,
                        email: true,
                        phone_number: true,
                        date_of_birth: true
                    }
                }
            }
        });

        res.status(200).json(courier);
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при получении курьера"}]})
    }
}

const createNewCourier = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()});
        }

        const rest = await prisma.restaurant.findFirst({
            where: {
                restaurant_admin: req.session!.user.id
            },
            select: {id: true}
        });

        if (rest === null) {
            return res.status(422).json({error: [{msg: "Ошибка при получении ресторана"}]})
        }

        let personal_data = await prisma.personal_data.create({
            data: {
                full_name: req.body.full_name,
                email: req.body.email,
                phone_number: req.body.phone_number,
                date_of_birth: stringToDate(req.body.date_of_birth)
            }
        })

        await prisma.courier.create({
            data: {
                salary: req.body.salary,
                personal_data: personal_data.id,
                restaurant: rest.id
            }
        })

        return res.status(200).json({message: "success"});
    } catch (err: any) {
        const errors = [
            "Unique constraint failed on the fields: (`email`)",
            "Unique constraint failed on the fields: (`phone_number`)"
        ]
        let message = "Ошибка при добавлении курьера"
        if (err.message.includes(errors[0])) {
            message = "Курьер с таким Email уже существует"
        } else if (err.message.includes(errors[1])) {
            message = "Курьер с таким номером телефона уже существует"
        }
        return res.status(422).json({error: [{msg: message}]});
    }
}

const changeCourier = async (req: Request, res: Response) => {
    try {

        if (!parseInt(req.params['courierId'], 10)) {
            return res.status(422).json({error: [{msg: "Неверный идентификатор курьера"}]})
        }
        let id = parseInt(req.params['courierId'], 10);
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()});
        }

        let oldCourier = await prisma.courier.findUnique({
            where: {id: id}
        });

        if (!oldCourier) {
            return res.status(422).json({error: [{msg: "Ошибка при получении курьера"}]})
        }

        if (!req.body.active && oldCourier.busy) {
            return res.status(422).json({error: [{msg: "Невозможно изменить статус пока курьер выполняет заказ"}]})
        }

        let newCourier = await prisma.courier.update({
            where: {id: id},
            data: {
                salary: req.body.salary,
                active: req.body.active,
                busy: req.body.active ? oldCourier.busy : false
            }
        })

        await prisma.personal_data.update({
            where: {
                id: newCourier.personal_data
            },
            data: {
                full_name: req.body.full_name,
                email: req.body.email,
                phone_number: req.body.phone_number,
                date_of_birth: req.body.date_of_birth,
            }
        });

        return res.status(200).json({message: "success"});
    } catch (err: any) {
        const errors = [
            "Unique constraint failed on the fields: (`email`)",
            "Unique constraint failed on the fields: (`phone_number`)"
        ]
        let message = "Ошибка при добавлении курьера"
        if (err.message.includes(errors[0])) {
            message = "Курьер с таким Email уже существует"
        } else if (err.message.includes(errors[1])) {
            message = "Курьер с таким номером телефона уже существует"
        }
        return res.status(422).json({error: [{msg: message}]});
    }
}

const deleteCourier = async (req: Request, res: Response) => {
    try {
        if (!parseInt(req.params['courierId'], 10)) {
            return res.status(422).json({error: [{msg: "Неверный идентификатор курьера"}]})
        }
        let id = parseInt(req.params['courierId'], 10);

        let courier = await prisma.courier.findUnique({
            where: {id: id},
            select: {personal_data: true}
        });

        if (courier === null) {
            return res.status(422).json({error: [{msg: "Курьер не существует"}]});
        }

        await prisma.courier.delete({
            where: {id: id}
        });

        await prisma.personal_data.delete({
            where: {id: courier.personal_data}
        });

        return res.status(200).json({message: "success"});
    } catch (err: any) {
        return res.status(422).json({error: [{msg: "Ошибка при удалении курьера"}]});
    }
}

export default {
    getAll: getAll,
    getOne: getOne,
    createNewCourier: createNewCourier,
    changeCourier: changeCourier,
    deleteCourier: deleteCourier
}

