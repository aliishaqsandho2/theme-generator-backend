
// src/controllers/themeController.ts
import { Request, Response } from 'express';
import * as themeService from '../services/themeService';

export const createTheme = async (req: Request, res: Response) => {
  try {
    const userData = req.body; // Expecting JSON structure from frontend
    const theme = await themeService.generateTheme(userData);
    res.json({ themeId: theme.id, downloadUrl: `/generated-themes/${theme.filePath}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate theme' });
  }
};
