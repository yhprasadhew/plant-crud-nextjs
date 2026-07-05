import { Pool } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let isInitialized = false;

// Automatically create database tables if they do not exist
export async function initDb() {
  try {
    // Create plants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        scientific_name VARCHAR(255),
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        stock INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create cart_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        plant_id INT REFERENCES plants(id) ON DELETE CASCADE,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, plant_id)
      );
    `);

    console.log("Database schema initialized successfully");
  } catch (error) {
    console.error("Database schema initialization failed:", error);
    throw error;
  }
}

// Query helper that ensures schema is initialized before executing
export async function query(text: string, params?: any[]) {
  if (!isInitialized) {
    await initDb();
    isInitialized = true;
  }
  return pool.query(text, params);
}
