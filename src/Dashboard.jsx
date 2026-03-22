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

  const [mostrarModal, setMostrarModal] = useState(false); // 🔥 NOVO

  const token = localStorage.getItem("token");

  const authHeader = {
    Authorization: `Bearer ${token}`,
  };

  /* =========================
     📊 BUSCAR
  ========================= */
  function buscarTransacoes() {
    fetch(`${import.meta.env.VITE_API_URL}/transacoes`, {
      headers: authHeader,
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTransacoes(data);
        } else {
          setTransacoes([]);
        }
      })
      .catch(console.error);
  }

  useEffect(() => {
    buscarTransacoes();
  }, []);

  /* =========================
     ➕ CRIAR
  ========================= */
  function criarTransacao(e) {
    e.preventDefault();

    fetch(`${import.meta.env.VITE_API_URL}/transacoes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      body: JSON.stringify({
        descricao,
        valor: Number(valor),
        tipo,
        data,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        buscarTransacoes();
        setDescricao("");
        setValor("");
        setData("");
        setMostrarModal(false); // 🔥 FECHA MODAL
      })
      .catch(console.error);
  }

  /* =========================
     ❌ DELETE
  ========================= */
  function deletarTransacao(id) {
    fetch(`${import.meta.env.VITE_API_URL}/transacoes/${id}`, {
      method: "DELETE",
      headers: authHeader,
    }).then(buscarTransacoes);
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

  return (
    <div className="dashboard">
      <div className="header">
        <h1>💰 Organizze</h1>
        {usuario && <p>Olá, {usuario.nome}!</p>}

        <div className="resumo-financeiro">
          <div className="resumo-card entrada">
            <span>Receitas</span>
            <strong>R$ {entradas}</strong>
          </div>

          <div className="resumo-card saida">
            <span>Despesas</span>
            <strong>R$ {saidas}</strong>
          </div>

          <div className="resumo-card saldo">
            <span>Saldo Total</span>
            <strong>R$ {saldo}</strong>
          </div>
        </div>
      </div>

      {/* LISTA */}
      <div className="lista-transacoes">
        <div className="cards">
          {transacoes.map((t) => (
            <div key={t.id} className={`card-retangulo ${t.tipo}`}>
              <div className="info-principal">
                <span>{t.descricao}</span>
                <span>R$ {t.valor}</span>
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

      {/* 🔥 BOTÃO FLUTUANTE */}
      <button className="fab" onClick={() => setMostrarModal(true)}>
        +
      </button>

      {/* 🔥 MODAL */}
      {mostrarModal && (
        <div className="modal-overlay">
          <form className="modal" onSubmit={criarTransacao}>
            <h2>Nova Transação</h2>

            <input
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />

            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />

            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>

            <div className="modal-buttons">
              <button type="submit">Adicionar</button>
              <button
                type="button"
                onClick={() => setMostrarModal(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <button onClick={logout} className="logout">
        Sair
      </button>
    </div>
  );
}

export default Dashboard;