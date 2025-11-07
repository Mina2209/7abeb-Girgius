import express from 'express';
import cors from "cors";

import hymnRoutes from './routes/hymn.routes.js';
import tagRoutes from './routes/tag.routes.js';
import sayingRoutes from './routes/saying.routes.js';

const app = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
}));

app.use('/api/hymns', hymnRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/sayings', sayingRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
