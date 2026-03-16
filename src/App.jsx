import { useState, useEffect } from "react";
import Login from "./Login";

import "./App.css";

function App() {
  const [transacoes, setTransacoes] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("entrada");
  const [usuario, setUsuario] = useState(null);

  // Função para buscar transações
  function buscarTransacoes() {
    fetch("http://localhost:3000/transacoes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTransacoes(data);
        } else {
          console.error("Resposta inesperada:", data);
          setTransacoes([]);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar transações:", err);
        setTransacoes([]);
      });
  }

  useEffect(() => {
    buscarTransacoes();
  }, []);

  function criarTransacao(e) {
    e.preventDefault();

    fetch("http://localhost:3000/transacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descricao,
        valor: Number(valor),
        tipo,
        data
      })
    }).then(() => {
      buscarTransacoes();
      setDescricao("");
      setValor("");
      setData("");
    });
  }

  function deletarTransacao(id) {
    fetch(`http://localhost:3000/transacoes/${id}`, {
      method: "DELETE"
    }).then(() => {
      buscarTransacoes();
    });
  }

  const entradas = transacoes
    .filter((t) => t.tipo === "entrada")
    .reduce((total, t) => total + Number(t.valor), 0);

  const saidas = transacoes
    .filter((t) => t.tipo === "saida")
    .reduce((total, t) => total + Number(t.valor), 0);

  const saldo = entradas - saidas;

  // 🔑 Aqui está a lógica correta
  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  return (
    <div className="dashboard">
      <h1>💰Organizze</h1>
      <h2>Olá, {usuario}!</h2>

      {/* Resumo financeiro */}
      <div className="resumo-financeiro">
        <div className="resumo-card entrada">
          <span className="titulo">Receita</span>
          <strong className="valor">R$ {entradas}</strong>
        </div>
        <div className="resumo-card saida">
          <span className="titulo">Despesa</span>
          <strong className="valor">R$ {saidas}</strong>
        </div>
        <div className="resumo-card saldo">
          <span className="titulo">Saldo geral</span>
          <strong className="valor">R$ {saldo}</strong>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={criarTransacao} className="formulario">
        <input
          type="text"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="input-padrao"
        />
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="input-padrao"
        />
        <input
          type="number"
          placeholder="Valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="input-padrao"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="input-padrao"
        >
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
        <button className="btn-adicionar">Adicionar</button>
      </form>

      {/* Lista de transações */}
      <h2>Minhas transações</h2>
      <div className="cards">
        {transacoes.map((t) => (
          <div className={`card-retangulo ${t.tipo}`} key={t.id}>
            <div className="info-principal">
              <span className="descricao">{t.descricao}</span>
              <span className="valor">R$ {t.valor}</span>
            </div>
            <div className="info-secundaria">
              <span>{t.tipo === "entrada" ? "💰 Receita" : "💸 Despesa"}</span>
              <span>📅 {new Date(t.data).toLocaleDateString("pt-BR")}</span>
            </div>
            <button className="delete" onClick={() => deletarTransacao(t.id)}>
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;