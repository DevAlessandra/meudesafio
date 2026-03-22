import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import "./Dashboard.css";

function Dashboard() {
  const { usuario, logout } = useContext(AuthContext);

  const [transacoes, setTransacoes] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("entrada");

  const token = localStorage.getItem("token");

  // 🔥 HEADER PADRÃO
  const authHeader = {
    Authorization: `Bearer ${token}`,
  };

  /* =========================
     📊 BUSCAR TRANSAÇÕES
  ========================= */
  function buscarTransacoes() {
    console.log("🔎 Buscando transações...");
    fetch(`${import.meta.env.VITE_API_URL}/transacoes`, {
      headers: authHeader,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Resposta da API (GET /transacoes):", data);
        if (Array.isArray(data)) {
          setTransacoes(data);
        } else {
          console.error("Erro da API:", data);
          setTransacoes([]);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar transações:", err);
      });
  }

  useEffect(() => {
    buscarTransacoes();
  }, []);

  /* =========================
     ➕ CRIAR TRANSAÇÃO
  ========================= */
  function criarTransacao(e) {
    e.preventDefault();

    const payload = {
      descricao,
      valor: Number(valor),
      tipo,
      data,
    };

    console.log("📤 Enviando nova transação:", payload);

    fetch(`${import.meta.env.VITE_API_URL}/transacoes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((novaTransacao) => {
        console.log("✅ Criada:", novaTransacao);
        buscarTransacoes();
        setDescricao("");
        setValor("");
        setData("");
      })
      .catch((err) => {
        console.error("Erro ao criar transação:", err);
      });
  }

  /* =========================
     ❌ DELETAR
  ========================= */
  function deletarTransacao(id) {
    console.log("🗑️ Deletando transação:", id);
    fetch(`${import.meta.env.VITE_API_URL}/transacoes/${id}`, {
      method: "DELETE",
      headers: authHeader,
    })
      .then(() => buscarTransacoes())
      .catch((err) => {
        console.error("Erro ao deletar:", err);
      });
  }

  /* =========================
     💰 CÁLCULOS
  ========================= */
  const entradas = transacoes
    .filter((t) => t.tipo === "entrada")
    .reduce((total, t) => total + Number(t.valor), 0);

  const saidas = transacoes
    .filter((t) => t.tipo === "saida")
    .reduce((total, t) => total + Number(t.valor), 0);

  const saldo = entradas - saidas;

  /* =========================
     🎨 UI
  ========================= */
  return (
    <div className="dashboard">
      <div className="header">
        <h1>💰 Organizze</h1>
        {usuario && <p>Olá, {usuario.nome}!</p>}

        {/* RESUMO */}
        <div className="resumo-financeiro">
          <div className="resumo-card entrada">
            <span>Receitas</span>
            <strong>R$ {entradas.toFixed(2)}</strong>
          </div>

          <div className="resumo-card saida">
            <span>Despesas</span>
            <strong>R$ {saidas.toFixed(2)}</strong>
          </div>

          <div className="resumo-card saldo">
            <span>Saldo Total</span>
            <strong>R$ {saldo.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={criarTransacao} className="formulario">
        <input
          className="input-padrao"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
        />

        <input
          className="input-padrao"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />

        <input
          className="input-padrao"
          placeholder="Valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
        />

        <select
          className="input-padrao"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>

        <button className="btn-adicionar">Adicionar</button>
      </form>

      {/* LISTA */}
      <div className="lista-transacoes">
        <div className="cards">
          {transacoes.map((t) => (
            <div key={t.id} className={`card-retangulo ${t.tipo}`}>
              <div className="info-principal">
                <span>{t.descricao}</span>
                <span>R$ {Number(t.valor).toFixed(2)}</span>
              </div>

              <div className="info-secundaria">
                <span>{t.tipo}</span>
                <span>{new Date(t.data).toLocaleDateString()}</span>
              </div>

              <button
                className="delete"
                onClick={() => deletarTransacao(t.id)}
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={logout} className="logout">
        Sair
      </button>
    </div>
  );
}

export default Dashboard;