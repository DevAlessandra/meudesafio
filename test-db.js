import pool from "./db.js";

async function testarConexao() {
  try {
    const resultado = await pool.query("SELECT NOW()");
    console.log("✅ Conexão bem-sucedida:", resultado.rows[0]);
  } catch (erro) {
    console.error("❌ Erro na conexão:", erro.message);
    console.error(erro); // log completo para ver detalhes
  } finally {
    pool.end();
  }
}

testarConexao();