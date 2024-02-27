import {Request, Response, NextFunction} from 'express';
export default function (shouldBeLoggedIn : boolean) {
    return function (req: Request, res : Response, next : NextFunction) {
        if (req.method === "OPTIONS") {
            next()
        }

        const token = req.headers.authorization ?  !!req.headers.authorization.split(" ")[1] : false;

        if (shouldBeLoggedIn === token)
            next();
        else if (shouldBeLoggedIn)
            return res.status(403).json({error: "Для продолжения войдите в систему"})
        else
            return res.status(403).json({error: "Доступ запрещен"})
    }
}