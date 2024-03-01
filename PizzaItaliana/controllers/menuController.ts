import path from "path";
import upload from "../upload";
import {validationResult} from "express-validator";
import {Request, Response} from 'express';
import {PrismaClient} from "@prisma/client";
import fs from "fs";
import {getAllObjectsPage} from "../utils";

const prisma = new PrismaClient();

const getAll = async (req: Request, res: Response) => {
    try {
        let pageQuery: string = req.query.page ? req.query.page.toString() : "1";

        let page: number;
        if (!parseInt(pageQuery, 10)) {
            page = 1;
        } else {
            page = parseInt(pageQuery, 10);
        }
        let products = await prisma.menu.findMany();
        const paginator = await getAllObjectsPage(products, page, 8);
        res.status(200).json(paginator);
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при отображении товаров"}]})
    }
}
const getProductForUpdate = async (req: Request, res: Response) => {
    try {
        if (!parseInt(req.params['productId'], 10)) {
            return res.status(422).json({error: "Неверный идентификатор товара"})
        }
        let id = parseInt(req.params['productId'], 10);

        let product = await prisma.menu.findUnique({
            where: {id: id}
        });

        res.status(200).json(product)
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при получении товара"}]})
    }
}

const getProductDetails = async (req: Request, res: Response) => {
    try {
        if (!parseInt(req.params['productId'], 10)) {
            return res.status(422).json({error: "Неверный идентификатор товара"})
        }
        let id = parseInt(req.params['productId'], 10);
        let product = await prisma.menu.findUnique({
            where: {id: id}
        });
        const sizes = await prisma.size_category.findMany({
            select: {
                id: true,
                item_size: true
            }
        });
        let prices = await prisma.size_category.findMany({
            select: {
                id: true,
                markup: true
            }
        });
        //prices = JSON.stringify(prices);

        res.status(200).json({
            product: product,
            sizes: sizes,
            prices: prices,
            current_size_option: 1
        })
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при получении информации о товаре"}]})
    }
}


const createNewProduct = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);

        if (req.file === undefined) {
            return res.status(422).json({error: [{msg: "Добавьте изображение товара"}]});
        }
        if (req.file.filename.length < 0 || req.file.filename.length > 50) {
            return res.status(422).json({error: [{msg: "Имя изображения не должно превышать 40 символов"}]})
        }
        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()});
        }
        await prisma.menu.create({
            data: {
                item_name: req.body.item_name,
                small_size_price: req.body.small_size_price,
                description: req.body.description,
                item_image: path.join(upload.upload_path, req.file.filename)
            }
        });

        return res.status(200).json({message: "success"});
    } catch (err) {
        fs.unlink(path.join(process.cwd(), 'public', 'images', req.file!.filename), (err) => {
            if (err) console.log('failed to delete product image')
        });
        return res.status(422).json({error: [{msg: "Ошибка при добавлении товара"}]})
    }
}

const changeProduct = async (req: Request, res: Response) => {
    try {
        if (!parseInt(req.params['productId'], 10)) {
            return res.status(422).json({error: [{msg: "Неверный идентификатор товара"}]})
        }
        let id = parseInt(req.params['productId'], 10);

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()});
        }

        let product = await prisma.menu.findUnique({
            where: {id: id},
            select: {
                item_image: true
            }
        });

        if (product === null) {
            return res.status(422).json({error: [{msg: "Товар не сущетсвует"}]});
        }

        let image_data = null;
        if (req.file !== undefined) {
            if (req.file.filename.length < 0 || req.file.filename.length > 50)
                return res.status(422).json({error: [{msg: "Имя изображения не должно превышать 40 символов"}]})
            else {
                fs.unlink(path.join(process.cwd(), 'public', product.item_image !== null ? product.item_image : ""), (err) => {
                    if (err) console.log('failed to delete product image')
                });
                image_data = path.join(upload.upload_path, req.file.filename);
            }
        } else {
            image_data = product.item_image!;
        }

        await prisma.menu.update({
            where: {id: id},
            data: {
                item_name: req.body.item_name,
                small_size_price: req.body.price,
                description: req.body.description,
                item_image: image_data
            }
        });
        return res.status(200).json({message: "success"});
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при обновлении товара"}]})
    }
}

const deleteProduct = async (req: Request, res: Response) => {
    try {
        if (!parseInt(req.params['productId'], 10)) {
            return res.status(422).json({error: [{msg: "Неверный идентификатор товара"}]})
        }
        let id = parseInt(req.params['productId'], 10);

        let product = await prisma.menu.findUnique({
            where: {id: id},
            select: {
                item_image: true
            }
        });

        if (product === null) {
            return res.status(422).json({error: [{msg: "Товар не сущетсвует"}]});
        }

        fs.unlink(path.join(process.cwd(), 'public', product.item_image!), (err) => {
            if (err) console.log('failed to delete product image')
        });

        await prisma.menu.delete({
            where: {id: id}
        });

        return res.status(200).json({message: "success"});
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при удалении товара"}]});
    }
}

export default {
    getAll: getAll,
    getProductForUpdate: getProductForUpdate,
    getProductDetails: getProductDetails,
    createNewProduct: createNewProduct,
    changeProduct: changeProduct,
    deleteProduct: deleteProduct
}
