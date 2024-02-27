import {Request, Response, NextFunction} from 'express';
import jwt from "jsonwebtoken";
import {secret} from "../config";


export default function (roles : string[]) {
    return function (req : Request, res : Response, next : NextFunction) {
        if (req.method === "OPTIONS") {
            next()
        }

        try {
            const token = req.headers.authorization ?  req.headers.authorization.split(" ")[1] : "";
            if (token.length === 0) {
                return res.status(403).json({error: "Пользователь не авторизован"})
            }
            //@ts-ignore
            const payload  = jwt.verify(token, secret.secret);
            //@ts-ignore
            let hasRole = roles.includes(payload.user_role_rel.role_name);

            if (!hasRole) {
                return res.status(403).json({error: "У вас нет доступа"})
            }
            next();
        } catch (e) {
            console.log(e)
            return res.status(403).json({error: "Пользователь не авторизован"})
        }
    }
};