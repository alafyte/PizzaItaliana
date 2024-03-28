import {Request, Response, NextFunction} from 'express';
export default function (shouldBeLoggedIn : boolean) {
    return function (req: Request, res : Response, next : NextFunction) {
        if (req.method === "OPTIONS") {
            next()
        }

        const token = req.headers.authorization ?  !!req.headers.authorization.split(" ")[1] : false;
        const session = req.cookies["_es_usr_session"];

        if (shouldBeLoggedIn && session === undefined)
            return res.status(403).json({error: "Для продолжения войдите в систему"})
        else if (shouldBeLoggedIn === token)
            next();
        else
            return res.status(403).json({error: "Доступ запрещен"})
    }
}