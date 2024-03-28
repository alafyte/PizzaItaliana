import {validationResult} from "express-validator";
import fs from 'fs';
import {Request, Response} from 'express';
import {prisma} from "../config";
import {FeatureCollectionType, FeatureType, FindNearestResultType, OrderStatus, Restaurant, UserRoles} from "../types";
import path from "path";
import {getAllObjectsPage} from "../utils";


const dir_file = path.join(process.cwd(), 'data_dir', 'data.json');

const getAll = async (req: Request, res: Response) => {
    try {
        let restaurants: Restaurant[] = await findAll();

        let feature_collection: FeatureCollectionType = {
            type: "FeatureCollection",
            features: []
        }

        let result_collection = [];

        for (let i = 0; i < restaurants.length; i++) {
            let geoJsonData = restaurants[i].location;
            let feature_location: FeatureType = {
                type: 'Feature',
                geometry: JSON.parse(geoJsonData!)
            }

            feature_collection.features.push(feature_location);

            geoJsonData = restaurants[i].coverage_area;
            let feature_area: FeatureType = {
                type: 'Feature',
                geometry: JSON.parse(geoJsonData!)
            }
            feature_collection.features.push(feature_area);

            result_collection.push({
                id: restaurants[i].id,
                address: restaurants[i].address,
                open_time: restaurants[i].open_time,
                close_time: restaurants[i].close_time,
                delivery_start_time: restaurants[i].delivery_start_time,
                delivery_end_time: restaurants[i].delivery_end_time,
                restaurant_admin: restaurants[i].admin,
            })
        }
        await fs.writeFile(dir_file, JSON.stringify(feature_collection), (e) => {
            if (e) {
                console.log(e)
            }
        });
        res.status(200).json(result_collection);
    } catch (err) {
        return res.status(500).json({error: [{msg: "Ошибка при получении ресторанов"}]})
    }
};

const getRestForChange = async (req: Request, res: Response) => {
    try {
        if (!parseInt(req.params['restaurantId'], 10)) {
            return res.status(422).json({error: [{msg: "Неверный идентификатор ресторана"}]})
        }
        let id: number = parseInt(req.params['restaurantId'], 10);

        const restaurant = await prisma.restaurant.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                address: true,
                restaurant_admin: true,
                open_time: true,
                close_time: true,
                delivery_start_time: true,
                delivery_end_time: true
            }
        });
        if (restaurant === null) {
            return res.status(422).json({error: [{msg: "Ошибка при получении ресторана"}]})
        }

        let current_admin = await prisma.app_user.findUnique({
            where: {
                id: restaurant.restaurant_admin
            },
            select: {
                id: true,
                personal_data_rel: {
                    select: {
                        full_name: true
                    }
                }
            }
        });
        let admins = await prisma.app_user.findMany({
            where: {
                AND: [
                    {restaurant: null},
                    {user_role: UserRoles.RESTAURANT_ADMIN}
                ]
            },
            select: {
                id: true,
                personal_data_rel: {
                    select: {
                        full_name: true
                    }
                }
            }
        });

        res.status(200).json({
            restaurant: restaurant,
            current_admin: current_admin,
            admins: admins
        })
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при получении данных для обновления ресторана"}]})
    }
};


const getUnassignedAdmins = async (req: Request, res: Response) => {
    try {
        let admins = await prisma.app_user.findMany({
            where: {
                AND: [
                    {restaurant: null},
                    {user_role: UserRoles.RESTAURANT_ADMIN}
                ]
            },
            select: {
                id: true,
                personal_data_rel: {
                    select: {
                        full_name: true
                    }
                }
            }
        });

        res.status(200).json(admins);
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при добавлении ресторана"}]})
    }
};

const getRestaurantByAdmin = async (req: Request, res: Response) => {
    try {
        let pageQuery: string = req.query.page ? req.query.page.toString() : "1";

        let page: number;
        if (!parseInt(pageQuery, 10)) {
            page = 1;
        } else {
            page = parseInt(pageQuery, 10);
        }

        const rest = await prisma.restaurant.findFirst({
            where: {
                restaurant_admin: req.session!.user.id
            },
            select: {
                id: true,
                address: true,
                open_time: true,
                close_time: true,
                delivery_start_time: true,
                delivery_end_time: true
            }
        });
        if (rest === null) {
            return res.status(422).json({error: [{msg: "Ошибка при получении ресторана"}]})
        }

        let orders = await prisma.user_order.findMany({
            where: {
                AND: [
                    {courier: {restaurant: rest.id}},
                    {status: {not: OrderStatus.DONE}}
                ]
            },
            orderBy: [{date_of_order: 'desc'}],
            select: {
                id: true,
                date_of_order: true,
                address: true,
                status: true,
                app_user: {
                    select: {
                        id: true,
                        personal_data_rel: {
                            select: {
                                full_name: true,
                                phone_number: true
                            }
                        }
                    }
                },
                order_items: {
                    select: {
                        item_quantity: true,
                        notes: true,
                        menu_item_info: {
                            select: {
                                menu: true,
                                size_category: true,
                            }
                        },
                        item_total_price: true
                    }
                }
            }
        });


        let resultOrders = getOrdersByPage(orders, page);
        let result = await getAllObjectsPage(resultOrders, orders.length, page, 3);

        res.status(200).json({
            restaurant: rest,
            paginator: result,
        });
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при получении ресторана"}]})
    }
}

const getRestaurantArchive = async (req: Request, res: Response) => {
    try {
        let pageQuery: string = req.query.page ? req.query.page.toString() : "1";

        let page: number;
        if (!parseInt(pageQuery, 10)) {
            page = 1;
        } else {
            page = parseInt(pageQuery, 10);
        }

        const rest = await prisma.restaurant.findFirst({
            where: {
                restaurant_admin: req.session!.user.id
            },
            select: {
                id: true
            }
        });
        if (rest === null) {
            return res.status(422).json({error: [{msg: "Ошибка при получении ресторана"}]})
        }

        let orders = await prisma.user_order.findMany({
            where: {
                AND: [
                    {courier: {restaurant: rest.id}},
                    {status: OrderStatus.DONE}
                ]
            },
            orderBy: [{date_of_order: 'desc'}],
            select: {
                id: true,
                date_of_order: true,
                address: true,
                status: true,
                app_user: {
                    select: {
                        personal_data_rel: {
                            select: {
                                full_name: true,
                                phone_number: true
                            }
                        }
                    }
                },
                order_items: {
                    select: {
                        item_quantity: true,
                        notes: true,
                        menu_item_info: {
                            select: {
                                menu: true,
                                size_category: true,
                            }
                        },
                        item_total_price: true
                    }
                }
            }
        });

        let resultOrders = getOrdersByPage(orders, page);

        let result = await getAllObjectsPage(resultOrders, orders.length, page, 3);

        res.status(200).json(result);
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при получении заказов ресторана"}]})
    }
}

const createNewRestaurant = (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);

        if (req.file === undefined) {
            return res.status(422).json({error: [{msg: "Добавьте область доставки"}]})
        }
        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()});
        }
        const coverage_area = req.file;
        let coverage_area_data = JSON.parse(coverage_area.buffer.toString('utf-8'));
        coverage_area_data = coverage_area_data.features[0].geometry;
        if (coverage_area_data.type !== 'Polygon') {
            throw new Error('Invalid coverage area geometry')
        }
        coverage_area_data = JSON.stringify(coverage_area_data);

        let location_data = `{\"type\": \"Point\", \"coordinates\": [ ${req.body.longitude}, ${req.body.latitude} ]}`;
        const admin_id = parseInt(req.body.admins, 10);

        let restData: Restaurant = {
            address: req.body.address,
            location: location_data,
            coverage_area: coverage_area_data,
            admin: admin_id,
            open_time: req.body.open_time,
            close_time: req.body.close_time,
            delivery_start_time: req.body.delivery_start_time,
            delivery_end_time: req.body.delivery_end_time,
        }
        createNewRestaurantQuery(restData)
            .then(() => res.status(200).json({message: "success"}))
            .catch((err: any) => {
                const errors = [
                    "Зона доставки пересекается с зоной доставки другого ресторана",
                    "Местоположение ресторана не находится в зоне доставки"
                ]
                if (err.message.includes(errors[0])) {
                    return res.status(422).json({error: [{msg: errors[0]}]})
                } else if (err.message.includes(errors[1])) {
                    return res.status(422).json({error: [{msg: errors[1]}]})
                }
                return res.status(422).json({error: [{msg: "Ошибка при добавлении ресторана"}]})
            });
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при добавлении ресторана"}]});
    }
}


const changeRest = (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);

        if (!parseInt(req.params['restaurantId'], 10)) {
            return res.status(422).json({error: [{msg: "Неверный идентификатор ресторана"}]})
        }
        if (!errors.isEmpty()) {
            return res.status(422).json({error: errors.array()});
        }
        let id: number = parseInt(req.params['restaurantId'], 10);

        let location_data = `{\"type\": \"Point\", \"coordinates\": [ ${req.body.longitude}, ${req.body.latitude} ]}`;
        let coverage_area_data = null;
        if (req.file !== undefined) {
            const coverage_area = req.file;
            coverage_area_data = JSON.parse(coverage_area.buffer.toString('utf-8'));
            coverage_area_data = coverage_area_data.features[0].geometry;
            if (coverage_area_data.type !== 'Polygon') {
                throw new Error('Invalid coverage area geometry')
            }
            coverage_area_data = JSON.stringify(coverage_area_data);
        }

        createUpdateRestaurantQuery(id, {
            address: req.body.address !== undefined ? req.body.address : null,
            location: location_data,
            coverage_area: coverage_area_data,
            open_time: req.body.open_time !== undefined ? req.body.open_time : null,
            close_time: req.body.close_time !== undefined ? req.body.close_time : null,
            admin: req.body.admins,
            delivery_start_time: req.body.delivery_start_time !== undefined ? req.body.delivery_start_time : null,
            delivery_end_time: req.body.delivery_end_time !== undefined ? req.body.delivery_end_time : null,
        })
            .then(() => res.status(200).json({message: "success"}))
            .catch((err: any) => {
                const errors = [
                    "Зона доставки пересекается с зоной доставки другого ресторана",
                    "Местоположение ресторана не находится в зоне доставки"
                ]
                if (err.message.includes(errors[0])) {
                    return res.status(422).json({error: [{msg: errors[0]}]})
                } else if (err.message.includes(errors[1])) {
                    return res.status(422).json({error: [{msg: errors[1]}]})
                }
                return res.status(422).json({error: [{msg: "Ошибка при изменении ресторана"}]})
            });
    } catch (err) {
        return res.status(422).json({error: [{msg: "Ошибка при обновлении ресторана"}]})
    }
};

const deleteRestaurant = (req: Request, res: Response) => {
    if (!parseInt(req.params['restaurantId'], 10)) {
        return res.status(422).json({error: [{msg: "Неверный идентификатор ресторана"}]})
    }
    let id: number = parseInt(req.params['restaurantId'], 10);

    prisma.restaurant.delete({
        where: {id: id}
    })
        .then(() => res.status(200).json({message: "success"}))
        .catch((err) => {
            if (err.message.includes('geometry')) {
                return res.status(200).json({message: "success"});
            }
            return res.status(422).json({error: [{msg: "Ошибка при удалении ресторана"}]})
        });

};

const findRestaurant = async (req: Request, res: Response) => {
    try {
        let result = await findNearest(Number(req.body.latitude), Number(req.body.longitude));

        return res.status(200).json({message: `Ближайший к вам ресторан находится по адресу ${result}`})
    } catch (err) {
        return res.status(422).json({error: "Ошибка при поиске ресторана"})
    }

}

const createNewRestaurantQuery = async (new_data: Restaurant) => {
    let query = `SELECT * FROM
        public.add_restaurant(
        '${new_data.address}'::text, 
        ST_GeomFromGeoJSON('${new_data.location}')::geometry,
        ST_GeomFromGeoJSON('${ new_data.coverage_area}')::geometry,
        ${new_data.admin},
        TO_TIMESTAMP('${new_data.open_time}', 'HH24:MI')::timestamp, 
        TO_TIMESTAMP('${new_data.close_time}', 'HH24:MI')::timestamp, 
        TO_TIMESTAMP('${new_data.delivery_start_time}', 'HH24:MI')::timestamp, 
        TO_TIMESTAMP('${new_data.delivery_end_time}', 'HH24:MI')::timestamp);`;

    return prisma.$executeRawUnsafe(`${query}`);
}

const createUpdateRestaurantQuery = async (id: number, new_data: Restaurant) => {
    let location_query;
    let area_query;

    if (new_data.location !== null) {
        location_query = `p_location => ST_GeomFromGeoJSON('${new_data.location}')::geometry,`;
    } else {
        location_query = '';
    }
    if (new_data.coverage_area !== null) {
        area_query = `p_coverage_area => ST_GeomFromGeoJSON('${new_data.coverage_area}')::geometry,`
    } else {
        area_query = '';
    }

    let query = `SELECT * FROM
        public.update_restaurant(
        p_id => ${id},
        p_address => '${new_data.address}'::text, 
        ${location_query} ${area_query} 
        p_admin => ${new_data.admin},
        p_open_time => TO_TIMESTAMP('${new_data.open_time}', 'HH24:MI')::timestamp, 
        p_close_time => TO_TIMESTAMP('${new_data.close_time}', 'HH24:MI')::timestamp, 
        p_delivery_start_time => TO_TIMESTAMP('${new_data.delivery_start_time}', 'HH24:MI')::timestamp, 
        p_delivery_end_time => TO_TIMESTAMP('${new_data.delivery_end_time}', 'HH24:MI')::timestamp);`;

    return prisma.$executeRawUnsafe(`${query}`);
}

const findNearest = async (userLatitude: number, userLongitude: number) => {
    let query = `SELECT * FROM public.find_nearest_restaurant(${userLatitude}, ${userLongitude});`;
    let result: FindNearestResultType[] = await prisma.$queryRawUnsafe(`${query}`);
    return result[0].find_nearest_restaurant;
}

const findAll = async (): Promise<Restaurant[]> => {
    return prisma.$queryRaw`SELECT * FROM public.get_restaurants_info;`;
}

const getOrdersByPage = (orders: any, page: number) => {
    let resultOrders = [];
    let pageSize = 3;
    for (let i = 0; i < orders.length; i++) {
        if (i >= pageSize * (page - 1) && i < pageSize * page) {
            resultOrders.push(orders[i]);
        }
    }

    for (let order of resultOrders) {
        let result_cost = 0;
        order.order_items.forEach((o: any) => result_cost += Number(o.item_total_price));
        order.total_price = result_cost.toFixed(2);
    }
    return resultOrders;
}


export default {
    getAll: getAll,
    getUnassignedAdmins: getUnassignedAdmins,
    getRestaurantByAdmin: getRestaurantByAdmin,
    createNewRestaurant: createNewRestaurant,
    getRestForChange: getRestForChange,
    deleteRestaurant: deleteRestaurant,
    changeRest: changeRest,
    findRestaurant: findRestaurant,
    getRestaurantArchive: getRestaurantArchive
}


