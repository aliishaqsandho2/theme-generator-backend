import express from 'express';
import cors from 'cors';
import themeRoutes from './routes/themeRoutes';
import { prisma } from './config/database';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/themes', themeRoutes);
app.use('/generated-themes', express.static(path.join(__dirname, '../generated-themes')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});