import process from "process";
import pool from "./db.js";

async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set. Skipping database initialization.");
    return;
  }

  console.log("Initializing database...");

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(200) NOT NULL
      );
    `);
    console.log("Table 'usuarios' OK");

    // Drop and recreate transacoes table if it's missing required columns
    const colCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'transacoes'
      ORDER BY ordinal_position;
    `);

    const existingColumns = colCheck.rows.map(r => r.column_name);
    console.log("Existing transacoes columns:", existingColumns);

    if (existingColumns.length > 0 && !existingColumns.includes("usuario_id")) {
      console.log("Column 'usuario_id' missing. Adding it...");
      await pool.query(`
        ALTER TABLE transacoes
          ADD COLUMN usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE;
      `);
      console.log("Column 'usuario_id' added successfully");
    } else if (existingColumns.length === 0) {
      console.log("Table 'transacoes' does not exist. Creating...");
      await pool.query(`
        CREATE TABLE transacoes (
          id SERIAL PRIMARY KEY,
          descricao VARCHAR(255) NOT NULL,
          data DATE NOT NULL,
          valor NUMERIC(10,2) NOT NULL,
          tipo VARCHAR(10) CHECK (tipo IN ('entrada','saida')) NOT NULL,
          usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE
        );
      `);
      console.log("Table 'transacoes' created");
    } else {
      console.log("Table 'transacoes' OK - all columns present");
    }

    console.log("Database initialization complete");
  } catch (err) {
    console.error("Erro ao inicializar banco:", err.message);
  }
}

initDb();