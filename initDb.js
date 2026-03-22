import process from "process";
import pool from "./db.js";

async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set. Skipping database initialization.");
    return;
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(200) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transacoes (
        id SERIAL PRIMARY KEY,
        descricao VARCHAR(255) NOT NULL,
        data DATE NOT NULL,
        valor NUMERIC(10,2) NOT NULL,
        tipo VARCHAR(10) CHECK (tipo IN ('entrada','saida')) NOT NULL,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `);

    // Migration: add usuario_id column if it was missing from an older schema
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'transacoes' AND column_name = 'usuario_id'
        ) THEN
          ALTER TABLE transacoes
            ADD COLUMN usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE;
        END IF;
      END
      $$;
    `);

    console.log("Tabelas verificadas/criadas com sucesso");
  } catch (err) {
    console.error("Erro ao inicializar banco:", err.message);
  }
}

initDb();