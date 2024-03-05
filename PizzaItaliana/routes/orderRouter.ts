import express from "express";

import controller from "../controllers/orderController";

import userLoginMiddleware from "../middleware/userLoginMiddleware";

const router = express.Router();

router.get('/', userLoginMiddleware(true), controller.getUserOrders);
router.post('/', userLoginMiddleware(true), controller.makeOrder);
router.put('/:orderId', userLoginMiddleware(true), controller.changeOrderStatus);

export default router;