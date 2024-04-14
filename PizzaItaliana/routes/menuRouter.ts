import express from "express";
import upload from "../upload";
import controller from "../controllers/menuController";
import roleMiddleware from "../middleware/roleMiddleware";
import {menuDataValidator} from "../validators";

const router = express.Router();


router.get('/', controller.getAll);
router.get('/search', controller.searchProduct);
router.get('/:productId', roleMiddleware(['head_admin']), controller.getProductForUpdate);
router.get('/details/:productId', controller.getProductDetails);

router.post('/:productId', roleMiddleware(['head_admin']), upload.upload_disk.single('item_image'),
    menuDataValidator,
    controller.changeProduct);

router.post('/', roleMiddleware(['head_admin']), upload.upload_disk.single('item_image'),
    menuDataValidator,
    controller.createNewProduct);

router.delete('/:productId', roleMiddleware(['head_admin']), controller.deleteProduct);

export default router;