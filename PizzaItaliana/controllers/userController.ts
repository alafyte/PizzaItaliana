import {Request, Response} from 'express';
import {prisma} from "../config";

const getUser = (req: Request, res: Response) => {
    try {
        let user = req.session?.user;
        if (user === null || user === undefined) {
            return res.status(422).json({error: [{msg: "Ошибка при получении данных пользователя"}]});
        }

        return res.status(200).json(user);

    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при получении данных пользователя"}]});
    }
}

const updatePersonalData = async (req: Request, res: Response) => {
    try {
        let user = req.session?.user;
        if (user === null || user === undefined) {
            return res.status(422).json({error: [{msg: "Ошибка при получении данных пользователя"}]});
        }

        let userPersonalData = await prisma.app_user.findUnique({
            where: {id: user.id},
            select: {
                personal_data: true
            }
        });

        if (userPersonalData === null) {
            return res.status(422).json({error: [{msg: "Ошибка при получении данных пользователя"}]});
        }

        let newUser = await prisma.personal_data.update({
            where: {id: userPersonalData.personal_data},
            data: {
                full_name: req.body.full_name,
                email: req.body.email,
                phone_number: req.body.phone_number,
                date_of_birth: req.body.date_of_birth
            }
        });

        req.session!.user = {
            id: user.id,
            full_name: newUser.full_name,
            email: newUser.email,
            phone_number: newUser.phone_number,
            date_of_birth: newUser.date_of_birth,
            role_name: user.role_name
        };

        return res.status(200).json({message: "success"});

    } catch (err: any) {
        const errors = [
            "Unique constraint failed on the fields: (`email`)",
            "Unique constraint failed on the fields: (`phone_number`)"
        ]
        let message = "Ошибка при обновлении данных профиля"
        if (err.message.includes(errors[0])) {
            message = "Пользователь с таким Email уже существует"
        } else if (err.message.includes(errors[1])) {
            message = "Пользователь с таким номером телефона уже существует"
        }
        return res.status(422).json({error: [{msg: message}]});
    }
}

export default {
    getUser: getUser,
    updatePersonalData: updatePersonalData
}