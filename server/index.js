import 'dotenv/config';
import express from 'express';
import cors from "cors";
import { fileURLToPath } from 'url';
import path from 'path';
import { PrismaClient } from '@prisma/client';

import hymnRoutes from './routes/hymn.routes.js';
import tagRoutes from './routes/tag.routes.js';
import sayingRoutes from './routes/saying.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const app = express();
const prisma = new PrismaClient();

// resolve __dirname for consistent uploads path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
}));

app.use('/api/hymns', hymnRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/sayings', sayingRoutes);
app.use('/api/uploads', uploadRoutes);

// note: uploads are served from S3 via presigned URLs; no local static serving

const PORT = process.env.PORT || 4000;

async function main() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Database connected.');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server due to database connection error:', err);
    process.exit(1);
  }
}

main();

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down...');
  try {
    await prisma.$disconnect();
  } catch (e) {
    console.error('Error disconnecting prisma:', e);
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
