import express from "express";
import controller from "../controllers/couriersController";
import roleMiddleware from "../middleware/roleMiddleware";
import {courierDataValidator} from "../validators";
const router = express.Router();


router.get('/', roleMiddleware(['restaurant_admin']), controller.getAll);
router.get('/:courierId', roleMiddleware(['restaurant_admin']), controller.getOne);
router.post('/', roleMiddleware(['restaurant_admin']), courierDataValidator, controller.createNewCourier);
router.put('/:courierId', roleMiddleware(['restaurant_admin']), courierDataValidator, controller.changeCourier);
router.delete('/:courierId', roleMiddleware(['restaurant_admin']), controller.deleteCourier)

export default router;