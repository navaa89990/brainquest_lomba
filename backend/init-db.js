import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { hashPassword } from './utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'brainquest.db');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function initializeDatabase() {
  // Reset database file to ensure new schema is applied
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('✓ Existing database file deleted for fresh setup');
  }

  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON');

  // Create Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      full_name TEXT,
      profile_picture TEXT,
      google_id TEXT UNIQUE,
      role TEXT DEFAULT 'user',
      points INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Quiz Records table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      material_id INTEGER,
      score INTEGER,
      total_questions INTEGER,
      time_spent INTEGER,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create Materials table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      category TEXT,
      difficulty_level TEXT,
      status TEXT,
      img TEXT,
      parent_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Questions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      option_a TEXT,
      option_b TEXT,
      option_c TEXT,
      option_d TEXT,
      correct_answer TEXT,
      explanation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
    )
  `);

  // Insert demo users
  try {
    const demoPassword = await hashPassword('demo123');
    const adminPassword = await hashPassword('admin123');

    await db.run(
      `INSERT INTO users (username, email, password, full_name, role, points, level) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['admin', 'admin@brainquest.com', adminPassword, 'Admin BrainQuest', 'admin', 0, 1]
    );

    await db.run(
      `INSERT INTO users (username, email, password, full_name, role, points, level) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['demo', 'demo@brainquest.com', demoPassword, 'Demo User', 'user', 500, 5]
    );

    console.log('✓ Demo admin created (username: admin, password: admin123)');
    console.log('✓ Demo user created (username: demo, password: demo123)');
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      console.log('✓ Demo admin and user already exist');
    } else {
      throw err;
    }
  }

  // Insert sample materials
  const materials = [
    {
      title: 'Pengenalan Matematika Dasar',
      description: 'Pembelajaran dasar tentang operasi matematika',
      category: 'Matematika',
      difficulty_level: 'Pemula',
    },
    {
      title: 'Bahasa Inggris Level 1',
      description: 'Pengenalan kosa kata bahasa Inggris',
      category: 'Bahasa',
      difficulty_level: 'Pemula',
    },
    {
      title: 'Fisika Klasik',
      description: 'Dasar-dasar fisika klasik dan hukum Newton',
      category: 'Sains',
      difficulty_level: 'Menengah',
    },
  ];

  for (const material of materials) {
    try {
      await db.run(
        `INSERT INTO materials (title, description, category, difficulty_level) 
         VALUES (?, ?, ?, ?)`,
        [material.title, material.description, material.category, material.difficulty_level]
      );
    } catch (err) {
      if (!err.message.includes('UNIQUE')) {
        console.log(`Skipped material: ${material.title}`);
      }
    }
  }

  console.log('✓ Database initialized successfully');
  console.log(`✓ Database location: ${DB_PATH}`);
  await db.close();
}

initializeDatabase().catch((err) => {
  console.error('✗ Error initializing database:', err);
  process.exit(1);
});
