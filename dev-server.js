import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import requestsHandler from './api/requests.js';
import cardsHandler from './api/cards.js';
import logsHandler from './api/logs.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Route handlers
app.all('/api/requests', requestsHandler);
app.all('/api/cards', cardsHandler);
app.all('/api/logs', logsHandler);

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`🔗 Proxy configured for /api routes`);
});
