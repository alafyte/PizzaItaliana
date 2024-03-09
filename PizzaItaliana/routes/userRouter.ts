import express from 'express';
const router = express.Router()
import controller from '../controllers/userController';
import userLoginMiddleware from '../middleware/userLoginMiddleware';
import {personalDataValidator} from "../validators";

router.get('/', userLoginMiddleware(true), controller.getUser);
router.post('/', userLoginMiddleware(true), personalDataValidator, controller.updatePersonalData);

export default router;