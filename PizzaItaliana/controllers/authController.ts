import {Request, Response} from 'express';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {App_user, PrismaClient} from "@prisma/client";
import {validationResult} from "express-validator";
import {secret} from "../config";
import {UserRoles} from "../types";
import {stringToDate} from "../utils";


const prisma = new PrismaClient();

const generateAccessToken = (user : App_user): string => {
    return jwt.sign(user, secret.secret, {expiresIn: "72h"})
}


const registration = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()})
        }
        if (req.body.password !== req.body.repeat_password) {
            return res.status(422).json({error: [{msg: "Пароли не совпадают"}]})
        }
        const {full_name, email, phone_number, date_of_birth, password} = req.body;

        const hashPassword = bcrypt.hashSync(password, 7);
        let personalData = await prisma.personal_data.create({
            data: {
                full_name: full_name,
                email: email,
                phone_number: phone_number,
                date_of_birth: stringToDate(date_of_birth),
            }
        });
        let user = await prisma.app_user.create({
            data: {
                password_hash: hashPassword,
                user_role: UserRoles.USER,
                personal_data: personalData.id
            }
        });

        await prisma.cart.create({
            data: {
                user_id: user.id
            }
        });
        return res.status(200).json({message: 'Success'});
    } catch (e: any) {
        const errors = [
            "Unique constraint failed on the fields: (`email`)",
            "Unique constraint failed on the fields: (`phone_number`)"
        ]
        let message = "Ошибка при регистрации"
        if (e.message.includes(errors[0])) {
            message = "Пользователь с таким Email уже существует"
        } else if (e.message.includes(errors[1])) {
            message = "Пользователь с таким номером телефона уже существует"
        }
        return res.status(422).json({error: [{msg: message}]})
    }
}

const login = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        let current_user = await prisma.app_user.findFirst({
            where: {
                personal_data_rel: {
                    email: email
                }
            },
            include: {
                personal_data_rel: true,
                user_role_rel: true
            }
        })
        if (!current_user) {
            return res.status(422).json({error: `Пользователь ${email} не найден`})
        }
        const validPassword = bcrypt.compareSync(password, current_user.password_hash)
        if (!validPassword) {
            return res.status(422).json({error: `Введен неверный пароль`})
        }
        // @ts-ignore
        delete current_user.password_hash;
        const token = generateAccessToken(current_user);

        req.session!.user = {
            id: current_user.id,
            full_name: current_user.personal_data_rel.full_name,
            email: current_user.personal_data_rel.email,
            phone_number: current_user.personal_data_rel.phone_number,
            date_of_birth: current_user.personal_data_rel.date_of_birth,
            role_name: current_user.user_role_rel.role_name
        };

        res.status(200).json({token: token});
    } catch (e) {
        return res.status(422).json({error: 'Ошибка входа'});
    }
}

const logout = (req: Request, res: Response) => {
    req.session!.user = {};
    return res.status(200).json({message: 'Success'});
}


export const controller = {
    registration: registration,
    login: login,
    logout: logout
}

