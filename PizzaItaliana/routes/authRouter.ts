import express from 'express';
const router = express.Router()
import {controller} from '../controllers/authController';
import userLoginMiddleware from '../middleware/userLoginMiddleware';
import {personalDataValidator} from "../validators";

router.post('/registration', userLoginMiddleware(false), personalDataValidator, controller.registration);
router.post('/login', userLoginMiddleware(false), controller.login);
router.get('/logout', userLoginMiddleware(true), controller.logout);

export default router;