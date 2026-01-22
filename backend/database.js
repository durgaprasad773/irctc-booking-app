import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';

const db = new sqlite3.Database('./irctc.db');


const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const get = promisify(db.get.bind(db));
const all = promisify(db.all.bind(db));

const initDatabase = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS trains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      number TEXT UNIQUE NOT NULL,
      source TEXT NOT NULL,
      destination TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      arrival_time TEXT NOT NULL,
      duration TEXT NOT NULL,
      sleeper_fare INTEGER NOT NULL,
      ac3_fare INTEGER NOT NULL,
      ac2_fare INTEGER NOT NULL,
      sleeper_available INTEGER NOT NULL,
      ac3_available INTEGER NOT NULL,
      ac2_available INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      train_id INTEGER NOT NULL,
      pnr TEXT UNIQUE NOT NULL,
      journey_date TEXT NOT NULL,
      class TEXT NOT NULL,
      passengers TEXT NOT NULL,
      total_fare INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT DEFAULT 'Confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (train_id) REFERENCES trains(id)
    )
  `);

  // Create default admin user if it doesn't exist
  const adminUser = await get('SELECT * FROM users WHERE email = ?', ['admin@irctc.com']);
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await run(
      'INSERT INTO users (name, email, password, phone, is_admin) VALUES (?, ?, ?, ?, ?)',
      ['Admin', 'admin@irctc.com', hashedPassword, '1234567890', 1]
    );
    console.log('Default admin user created: admin@irctc.com / admin123');
  }

  console.log('Database initialized successfully');
};

export { db, run, get, all, initDatabase };
