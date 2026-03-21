// db.js
import pkg from "pg";
const { Pool } = pkg;
import process from "process";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // obrigatório no Render
  },
});

export default pool;