import express from "express";

import roleMiddleware from "../middleware/roleMiddleware";

import controller from "../controllers/adminController";

import {personalDataValidator} from "../validators";

const router = express.Router();


router.get('/', roleMiddleware(['head_admin']), controller.getRestaurantAdministrators);

router.post('/', roleMiddleware(['head_admin']), personalDataValidator, controller.createNewRestAdmin);

export default router;