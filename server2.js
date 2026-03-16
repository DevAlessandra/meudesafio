import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import pool from "./db.js";
const app = express();
const PORT = 3000;

// habilita CORS para qualquer origem
app.use(cors())

// permite receber JSON
app.use(express.json())

let transacoes = []




function validarTransacao(req, res, next) {

    const { descricao, valor, tipo } = req.body

    if (!descricao || descricao.length < 3) {
        return res.status(400).json({
            mensagem: "Descrição deve ter no mínimo 3 caracteres"
        })
    }

    if (typeof valor !== "number" || valor <= 0) {
        return res.status(400).json({
            mensagem: "Valor deve ser um número maior que 0"
        })
    }

    if (tipo !== "entrada" && tipo !== "saida") {
        return res.status(400).json({
            mensagem: "Tipo deve ser 'entrada' ou 'saida'"
        })
    }

    next();
}
// ROTA INICIAL
app.get("/", (req,res)=>{
    res.send("API Controle Financeiro")
})
// LISTAR TRANSAÇÕES
app.get("/transacoes", async (req, res) => {
  try {

    const resultado = await pool.query("SELECT * FROM transacoes")

    res.json(resultado.rows)

  } catch (erro) {

    console.error("ERRO NO BANCO:", erro)

    res.status(500).json({
      mensagem: "Erro ao listar transações",
      erro: erro.message
    })

  }
})

// CRIAR ENTRADA OU SAÍDA
app.post("/transacoes", validarTransacao, async (req, res) => {
    const { descricao, valor, tipo, data } = req.body; // agora recebendo também 'data'

    try {
        const nova = await pool.query(
            "INSERT INTO transacoes (descricao, valor, tipo, data) VALUES ($1,$2,$3,$4) RETURNING *",
            [descricao, valor, tipo, data || new Date()] // se não vier 'data', usa a atual
        );

        res.status(201).json({
            mensagem: "Transação registrada com sucesso",
            transacao: nova.rows[0]
        });
    } catch (err) {
        console.error("Erro ao registrar transação:", err);
        res.status(500).json({ mensagem: "Erro ao registrar transação" });
    }
});

// CALCULAR SALDO
app.get("/saldo", (req, res) => {

    let saldo = 0

    transacoes.forEach(transacao => {
        if (transacao.tipo === "entrada") {
            saldo += transacao.valor
        } else {
            saldo -= transacao.valor
        }
    })

    res.json({ saldo })
})


// ATUALIZAR TRANSAÇÃO
app.put("/transacoes/:id", validarTransacao, (req, res) => {

    const id = parseInt(req.params.id)

    const transacao = transacoes.find(t => t.id === id)

    if (!transacao) {
        return res.status(404).json({ mensagem: "Transação não encontrada" })
    }

    const { descricao, valor, tipo } = req.body

    transacao.descricao = descricao
    transacao.valor = valor
    transacao.tipo = tipo

    res.json({
        mensagem: "Transação atualizada",
        transacao
    })
})


// DELETAR TRANSAÇÃO
app.delete("/transacoes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await pool.query(
            "DELETE FROM transacoes WHERE id = $1",
            [id]
        );
        res.json({
            mensagem: "Transação removida com sucesso"
        });
    } catch (err) {
        console.error("Erro ao remover transação:", err);
        res.status(500).json({ mensagem: "Erro ao remover transação" });
    }
});


// SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})