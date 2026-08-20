import { Router } from 'express';
import { getAllCategoriesHandler } from './categories.controller';

const router = Router();

router.get('/', getAllCategoriesHandler);

export default router;
