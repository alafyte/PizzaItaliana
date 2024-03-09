import express from "express";

import roleMiddleware from "../middleware/roleMiddleware";

import controller from "../controllers/adminController";

import {registrationDataValidator} from "../validators";

const router = express.Router();


router.get('/', roleMiddleware(['head_admin']), controller.getRestaurantAdministrators);

router.post('/', roleMiddleware(['head_admin']), registrationDataValidator, controller.createNewRestAdmin);

export default router;