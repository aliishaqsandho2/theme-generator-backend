
// src/routes/themeRoutes.ts
import { Router } from 'express';
import { createTheme } from '../controllers/themeController';

const router = Router();
router.post('/create', createTheme);

export default router;