import bcrypt from "bcryptjs";
import {validationResult} from "express-validator";
import {Request, Response} from 'express';
import {PrismaClient} from "@prisma/client";
import {UserRoles} from "../types";
import {stringToDate} from "../utils";

const prisma = new PrismaClient();

const createNewRestAdmin = async (req : Request, res : Response) => {
    try {
        if (req.body.password !== req.body.repeat_password) {
            return res.status(422).json({error: [{msg: "Пароли не совпадают"}]})
        }
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()});
        }

        const hashPassword = bcrypt.hashSync(req.body.password, 7);


        let personalData = await prisma.personal_data.create({
            data: {
                full_name: req.body.full_name,
                email: req.body.email,
                phone_number: req.body.phone_number,
                date_of_birth: stringToDate(req.body.date_of_birth)
            }
        });

        let newAdmin = await prisma.app_user.create({
            data: {
                password_hash: hashPassword,
                personal_data: personalData.id,
                user_role: UserRoles.RESTAURANT_ADMIN
            }
        });

        await prisma.cart.create({
            data: {
                user_id: newAdmin.id
            }
        });

        return res.status(200).json({message: "success"});
    } catch (err : any) {
        const errors = [
            "Unique constraint failed on the fields: (`email`)",
            "Unique constraint failed on the fields: (`phone_number`)"
        ]
        let message = "Ошибка при регистрации администратора"
        if (err.message.includes(errors[0])) {
            message = "Пользователь с таким Email уже существует"
        } else if (err.message.includes(errors[1])) {
            message = "Пользователь с таким номером телефона уже существует"
        }
        return res.status(422).json({error: [{msg: message}]})
    }
};

const getRestaurantAdministrators = async (req : Request, res : Response) => {
    try {
        const admins = await prisma.app_user.findMany({
            where: {user_role: UserRoles.RESTAURANT_ADMIN},
            select: {
                id: true,
                personal_data_rel: true,
                restaurant: {
                    select: {
                        address: true
                    }
                }
            }
        });

        res.status(200).json(admins);
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при получении администраторов"}]})
    }
}

export default {
    createNewRestAdmin: createNewRestAdmin,
    getRestaurantAdministrators: getRestaurantAdministrators,
}

