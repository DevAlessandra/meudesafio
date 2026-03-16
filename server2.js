import dotenv from "dotenv";
dotenv.config();
import process from "process";
import express from "express";
import cors from "cors";
import pool from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

// habilita CORS para qualquer origem
app.use(cors());

// permite receber JSON
app.use(express.json());

// Middleware de validação
function validarTransacao(req, res, next) {
  const { descricao, valor, tipo } = req.body;

  if (!descricao || descricao.length < 3) {
    return res.status(400).json({
      mensagem: "Descrição deve ter no mínimo 3 caracteres",
    });
  }

  if (typeof valor !== "number" || valor <= 0) {
    return res.status(400).json({
      mensagem: "Valor deve ser um número maior que 0",
    });
  }

  if (tipo !== "entrada" && tipo !== "saida") {
    return res.status(400).json({
      mensagem: "Tipo deve ser 'entrada' ou 'saida'",
    });
  }

  next();
}

// ROTA INICIAL
app.get("/", (req, res) => {
  res.send("API Controle Financeiro");
});

// LISTAR TRANSAÇÕES
app.get("/transacoes", async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM transacoes ORDER BY id DESC");
    res.json(resultado.rows);
  } catch (erro) {
    console.error("ERRO NO BANCO:", erro);
    res.status(500).json({
      mensagem: "Erro ao listar transações",
      erro: erro.message,
    });
  }
});

// CRIAR TRANSAÇÃO
app.post("/transacoes", validarTransacao, async (req, res) => {
  const { descricao, data, valor, tipo } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO transacoes (descricao, data, valor, tipo) VALUES ($1, $2, $3, $4) RETURNING *",
      [descricao, data, valor, tipo]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao adicionar transação");
  }
});

// ATUALIZAR TRANSAÇÃO
app.put("/transacoes/:id", validarTransacao, async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, tipo, data } = req.body;

  try {
    const result = await pool.query(
      "UPDATE transacoes SET descricao=$1, valor=$2, tipo=$3, data=$4 WHERE id=$5 RETURNING *",
      [descricao, valor, tipo, data, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensagem: "Transação não encontrada" });
    }

    res.json({ mensagem: "Transação atualizada", transacao: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar transação");
  }
});

// EXCLUIR TRANSAÇÃO
app.delete("/transacoes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM transacoes WHERE id = $1", [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao excluir transação");
  }
});

// CALCULAR SALDO
app.get("/saldo", async (req, res) => {
  try {
    const entradas = await pool.query("SELECT COALESCE(SUM(valor),0) AS total FROM transacoes WHERE tipo='entrada'");
    const saidas = await pool.query("SELECT COALESCE(SUM(valor),0) AS total FROM transacoes WHERE tipo='saida'");

    const saldo = Number(entradas.rows[0].total) - Number(saidas.rows[0].total);

    res.json({ saldo });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao calcular saldo");
  }
});

// SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});