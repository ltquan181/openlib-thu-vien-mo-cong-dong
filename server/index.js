import express from 'express';
import cors from 'cors';
import { initDatabase } from './db.js';
import apiRouter from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount API routes
app.use('/api', apiRouter);

// Start server after initializing DB
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 OpenLib MySQL Backend Server running at http://localhost:${PORT}`);
      console.log(`📡 API Endpoints ready at http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('❌ Failed to start MySQL Backend server:', err);
    process.exit(1);
  }
}

startServer();
