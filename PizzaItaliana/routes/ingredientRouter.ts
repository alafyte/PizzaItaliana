import express from "express";
import controller from "../controllers/ingredientsController";
import roleMiddleware from "../middleware/roleMiddleware";
import {ingredientDataValidator} from "../validators";
const router = express.Router();

router.get('/all', roleMiddleware(['head_admin']), controller.getAll);
router.get('/:ingredientId', controller.getOne);
router.get('/', roleMiddleware(['head_admin']), controller.getIngredients);
router.post('/', roleMiddleware(['head_admin']), ingredientDataValidator, controller.addIngredient);
router.put('/:ingredientId', roleMiddleware(['head_admin']), ingredientDataValidator, controller.updateIngredient);
router.delete('/:ingredientId', roleMiddleware(['head_admin']), controller.deleteIngredient);

export default router;