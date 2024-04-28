import path from "path";
import upload from "../upload";
import {validationResult} from "express-validator";
import {Request, Response} from 'express';
import {prisma} from "../config";
import fs from "fs";
import {getAllObjectsPage} from "../utils";
import {Menu, PrismaPromise} from "@prisma/client";


const getAll = async (req: Request, res: Response) => {
    try {
        let pageQuery: string = req.query.page ? req.query.page.toString() : "1";

        let page: number;
        if (!parseInt(pageQuery, 10)) {
            page = 1;
        } else {
            page = parseInt(pageQuery, 10);
        }
        let products = await getProductsByPageQuery(page, 8);
        let productsLength = await prisma.menu.count();
        const paginator = await getAllObjectsPage(products, productsLength, page, 8);
        res.status(200).json(paginator);
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при отображении товаров"}]})
    }
}

const searchProduct = async (req: Request, res: Response) => {
    try {
        let pageQuery: string = req.query.page ? req.query.page.toString() : "1";

        let page: number;
        if (!parseInt(pageQuery, 10)) {
            page = 1;
        } else {
            page = parseInt(pageQuery, 10);
        }

        let searchQuery: string = req.query.name ? req.query.name.toString() : "";

        if (searchQuery !== "") {
            let products = await getProductsByPageByNameQuery(page, 8, searchQuery);
            const paginator = await getAllObjectsPage(products, products.length, page, 8);
            res.status(200).json(paginator);
        } else {
            res.redirect("/menu");
        }
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
        let ingredients = await prisma.ingredient_menu.findMany({
            where: {menu: product?.id},
            select: {
                ingredient_ingredient: {
                    select: {
                        id: true
                    }
                }
            }
        });

        res.status(200).json({
            product: product,
            ingredients: ingredients.map((ingr) => ingr.ingredient_ingredient.id),
        });
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
            where: {id: id},
        });
        let ingredients = await prisma.ingredient_menu.findMany({
            where: {menu: product?.id},
            select: {
                ingredient_ingredient: true
            }
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

        res.status(200).json({
            product: product,
            sizes: sizes,
            prices: prices,
            ingredients: ingredients.map((ingr) => ingr.ingredient_ingredient),
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

        const ingredients = JSON.parse(req.body.ingredients);
        if (ingredients.length == 0)
            return res.status(422).json({error: [{msg: "Добавьте ингредиенты товара"}]});

        let createIngredients = ingredients.map((ingr: number) => ({
            ingredient_ingredient: {
                connect: {id: ingr}
            }
        }));

        await prisma.menu.create({
            data: {
                item_name: req.body.item_name,
                small_size_price: req.body.small_size_price,
                item_image: path.join(upload.upload_path, req.file.filename),
                ingredients: {
                    create: createIngredients
                }
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

        const ingredients = JSON.parse(req.body.ingredients);
        if (ingredients.length == 0)
            return res.status(422).json({error: [{msg: "Добавьте ингредиенты товара"}]});

        let update = ingredients.map((ingr: number) => ({
            ingredient_ingredient: {
                connect: {id: ingr}
            }
        }));


        await prisma.menu.update({
            where: {id: id},
            data: {
                item_name: req.body.item_name,
                small_size_price: req.body.price,
                item_image: image_data,
                ingredients: {
                    deleteMany: {},
                    create: update
                }
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

        await prisma.menu.update({
            where: {id: id},
            data: {
                ingredients: {
                    deleteMany: {}
                }
            }
        });

        await prisma.menu.delete({
            where: {id: id}
        });

        await deleteOrphanUserOrders();

        return res.status(200).json({message: "success"});
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при удалении товара"}]});
    }
}

const deleteOrphanUserOrders = async () => {
    await prisma.$executeRaw`CALL DELETE_ORPHAN_USER_ORDERS();`;
}

const getProductsByPageQuery = (page: number, pageSize: number) => {
    let query = `SELECT * FROM
        public.GET_MENU_ITEMS_PAGE(
        P_PAGE_NUMBER => ${page},
        P_PAGE_SIZE => ${pageSize});`;

    return prisma.$queryRawUnsafe(`${query}`);
}

const getProductsByPageByNameQuery = (page: number, pageSize: number, pName: string): PrismaPromise<Menu[]> => {
    let query = `SELECT * FROM
        public.GET_MENU_ITEMS_PAGE_BY_NAME(
        P_PAGE_NUMBER => ${page},
        P_PAGE_SIZE => ${pageSize},
        P_PRODUCT_NAME => '${pName}'::text);`;

    return prisma.$queryRawUnsafe(`${query}`);
}

export default {
    getAll: getAll,
    searchProduct: searchProduct,
    getProductForUpdate: getProductForUpdate,
    getProductDetails: getProductDetails,
    createNewProduct: createNewProduct,
    changeProduct: changeProduct,
    deleteProduct: deleteProduct
}
