import express from "express";
import upload from "../upload";
import controller from "../controllers/restaurantsController";
import roleMiddleware from "../middleware/roleMiddleware";
import {restaurantDataValidator} from "../validators";


const router = express.Router();


router.get('/', controller.getAll);
router.get('/unassigned-admins', roleMiddleware(['head_admin']), controller.getUnassignedAdmins);
router.get('/restaurant', roleMiddleware(['restaurant_admin']), controller.getRestaurantByAdmin);
router.get('/restaurant/archive', roleMiddleware(['restaurant_admin']), controller.getRestaurantArchive);
router.get('/:restaurantId', roleMiddleware(['head_admin']), controller.getRestForChange);

router.post('/find', controller.findRestaurant);

router.post('/:restaurantId', roleMiddleware(['head_admin']),
   upload.upload.single('coverage_area'), restaurantDataValidator,
   controller.changeRest);

router.post('/', roleMiddleware(['head_admin']),
    upload.upload.single('coverage_area'), restaurantDataValidator, controller.createNewRestaurant);

router.delete('/:restaurantId', roleMiddleware(['head_admin']), controller.deleteRestaurant);

export default router;