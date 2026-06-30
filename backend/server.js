import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { registerRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { quizRoutes } from './routes/quiz.js';
import { materialRoutes } from './routes/materials.js';

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db;

async function initDb() {
  db = await open({
    filename: path.join(DATA_DIR, 'brainquest.db'),
    driver: sqlite3.Database,
  });
  await db.exec('PRAGMA foreign_keys = ON');
  console.log('✓ Database connected');
  return db;
}

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.JWT_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Make db accessible to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use('/auth', registerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/materials', materialRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`\n🚀 BrainQuest Backend running on http://localhost:${PORT}`);
      console.log(`📦 Frontend URL: ${FRONTEND_URL}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (err) {
    console.error('✗ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;
