import express from "express";
import controller from "../controllers/cartController";
import userLoginMiddleware from "../middleware/userLoginMiddleware";

const router = express.Router();
router.get('/', userLoginMiddleware(true), controller.getUserCartInfo);

router.post('/', userLoginMiddleware(true), controller.addToCart);
router.put('/:itemId', userLoginMiddleware(true), controller.changeQuantity);
router.delete('/:itemId', userLoginMiddleware(true), controller.deleteItemFromCart);
router.post('/purge', userLoginMiddleware(true), controller.purgeCart);

export default router;