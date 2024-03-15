import {Request, Response} from 'express';
import {prisma} from "../config";
import {validationResult} from "express-validator";

const getIngredients = async (req: Request, res: Response) => {
    try {
        let ingredients = await prisma.ingredient.findMany({
            orderBy: [{id: 'asc'}]
        });
        return res.status(200).json(ingredients);
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при отображении ингредиентов"}]})
    }
}

const getOne = async (req: Request, res: Response) => {
    try {
        if (!parseInt(req.params['ingredientId'], 10)) {
            return res.status(422).json({error: [{msg: "Неверный идентификатор ингредиента"}]})
        }
        let id = parseInt(req.params['ingredientId'], 10);

        let ingredient = await prisma.ingredient.findUnique({
            where: {id: id}
        });

        return res.status(200).json(ingredient);

    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при получении ингредиента"}]})
    }
}

const addIngredient = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()});
        }

        await prisma.ingredient.create({
            data: {
                name: req.body.ingredient_name,
                removable: req.body.removable
            }
        })

        return res.status(200).json({message: "success"});
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при добавлении ингредиента"}]})
    }
}

const updateIngredient = async (req: Request, res: Response) => {
    try {
        if (!parseInt(req.params['ingredientId'], 10)) {
            return res.status(422).json({error: [{msg: "Неверный идентификатор ингредиента"}]})
        }
        let id = parseInt(req.params['ingredientId'], 10);

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()});
        }

        await prisma.ingredient.update({
            where: {id: id},
            data: {
                name: req.body.ingredient_name,
                removable: req.body.removable
            }
        })

        return res.status(200).json({message: "success"});
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при обновлении товара"}]})
    }
}

const deleteIngredient = async (req: Request, res: Response) => {
    try {
        if (!parseInt(req.params['ingredientId'], 10)) {
            return res.status(422).json({error: [{msg: "Неверный идентификатор ингредиента"}]})
        }
        let id = parseInt(req.params['ingredientId'], 10);

        await prisma.ingredient.delete({
            where: {id: id}
        });

        return res.status(200).json({message: "success"});
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при удалении ингредиента"}]});
    }
}

export default {
    getIngredients: getIngredients,
    getOne: getOne,
    addIngredient: addIngredient,
    updateIngredient: updateIngredient,
    deleteIngredient: deleteIngredient,
}