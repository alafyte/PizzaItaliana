import {Request, Response} from 'express';
import {prisma} from "../config";
import {validationResult} from "express-validator";
import {getAllObjectsPage} from "../utils";

const getAll = async (req: Request, res: Response) => {
    try {
        let ingredients = await prisma.ingredient.findMany();
        return res.status(200).json(ingredients);
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при отображении ингредиентов"}]})
    }
}

const getIngredientsByPage = async (req: Request, res: Response) => {
    try {
        let pageQuery: string = req.query.page ? req.query.page.toString() : "1";
        let page: number;
        if (!parseInt(pageQuery, 10)) {
            page = 1;
        } else {
            page = parseInt(pageQuery, 10);
        }

        let ingredients = await getIngredientsByPageQuery(page, 8);

        let ingredientsLength = await prisma.ingredient.count();
        const paginator = await getAllObjectsPage(ingredients, ingredientsLength, page, 8);
        return res.status(200).json(paginator);
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

const getIngredientsByPageQuery = (page: number, pageSize: number) => {
    let query = `SELECT * FROM
        public.GET_INGREDIENTS_PAGE(
        P_PAGE_NUMBER => ${page},
        P_PAGE_SIZE => ${pageSize});`;

    return prisma.$queryRawUnsafe(`${query}`);
}

export default {
    getIngredients: getIngredientsByPage,
    getOne: getOne,
    getAll: getAll,
    addIngredient: addIngredient,
    updateIngredient: updateIngredient,
    deleteIngredient: deleteIngredient,
}