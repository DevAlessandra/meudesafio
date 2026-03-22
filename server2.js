import dotenv from "dotenv";
dotenv.config();
import process from "process";
import "./initDb.js";

import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS (permitindo frontend do Vercel)
app.use(cors({
  origin: process.env.CORS_ORIGIN || "https://organizzecontrole.vercel.app",
  credentials: true,
}));

app.use(express.json());

/* =========================
   🔐 MIDDLEWARE AUTH
========================= */
function autenticar(req, res, next) {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = decoded.id;
    next();
  } catch (err) {
    console.error("ERRO NA AUTENTICAÇÃO:", err);
    return res.status(401).json({ erro: "Token inválido" });
  }
}

/* =========================
   🏠 ROTA INICIAL
========================= */
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

/* =========================
   📝 CADASTRO
========================= */
app.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email",
      [nome, email, senhaHash]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERRO NO REGISTER:", err);

    if (err.code === "23505") {
      return res.status(400).json({ erro: "Email já cadastrado" });
    }

    res.status(500).json({ erro: "Erro ao cadastrar usuário" });
  }
});

/* =========================
   🔑 LOGIN
========================= */
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ erro: "Usuário não encontrado" });
    }

    const usuario = user.rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha inválida" });
    }

    const token = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (err) {
    console.error("ERRO NO LOGIN:", err);
    res.status(500).json({ erro: "Erro ao fazer login" });
  }
});

/* =========================
   📊 LISTAR TRANSAÇÕES
========================= */
app.get("/transacoes", autenticar, async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM transacoes WHERE usuario_id = $1 ORDER BY id DESC",
      [req.usuarioId]
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error("ERRO REAL:", erro);
    res.status(500).json({ erro: erro.message });
  }
});

/* =========================
   ➕ CRIAR TRANSAÇÃO
========================= */
app.post("/transacoes", autenticar, async (req, res) => {
  const { descricao, data, valor, tipo } = req.body;

  if (!descricao || !valor || !tipo) {
    return res.status(400).json({ erro: "Dados inválidos" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO transacoes (descricao, data, valor, tipo, usuario_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [descricao, data, valor, tipo, req.usuarioId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("ERRO AO CRIAR:", err);
    res.status(500).json({ erro: err.message });
  }
});

/* =========================
   ✏️ ATUALIZAR
========================= */
app.put("/transacoes/:id", autenticar, async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, tipo, data } = req.body;

  try {
    const result = await pool.query(
      "UPDATE transacoes SET descricao=$1, valor=$2, tipo=$3, data=$4 WHERE id=$5 AND usuario_id=$6 RETURNING *",
      [descricao, valor, tipo, data, id, req.usuarioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Transação não encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERRO AO ATUALIZAR:", err);
    res.status(500).json({ erro: err.message });
  }
});

/* =========================
   ❌ EXCLUIR
========================= */
app.delete("/transacoes/:id", autenticar, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      "DELETE FROM transacoes WHERE id = $1 AND usuario_id = $2",
      [id, req.usuarioId]
    );

    res.sendStatus(204);
  } catch (err) {
    console.error("ERRO AO EXCLUIR:", err);
    res.status(500).json({ erro: err.message });
  }
});

/* =========================
   💰 SALDO
========================= */
app.get("/saldo", autenticar, async (req, res) => {
  try {
    const entradas = await pool.query(
      "SELECT COALESCE(SUM(valor),0) AS total FROM transacoes WHERE tipo='entrada' AND usuario_id=$1",
      [req.usuarioId]
    );

    const saidas = await pool.query(
      "SELECT COALESCE(SUM(valor),0) AS total FROM transacoes WHERE tipo='saida' AND usuario_id=$1",
      [req.usuarioId]
    );

    const saldo =
      Number(entradas.rows[0].total) -
      Number(saidas.rows[0].total);

    res.json({ saldo });
  } catch (err) {
    console.error("ERRO NO SALDO:", err);
    res.status(500).json({ erro: err.message });
  }
});

/* =========================
   🚀 START
========================= */
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});