import { useState } from "react";
import "./logincss.css";

function Login({ onLogin }) {
  const [nome, setNome] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (nome.trim()) {
      onLogin(nome);
    }
  }

  return (
    <div className="login-container">
      {/* Cabeçalho estilo landing page */}
      <header className="hero">
        <div className="hero-text">
          <h1> 💰 Organizze</h1>
          <h2>Seu dinheiro sob controle</h2>
          <p>Tudo o que você precisa para organizar suas finanças sem esforço.</p>
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="text"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <button type="submit">Começar agora</button>
          </form>
        </div>
        <div className="hero-image">
         <img src="/Imagem.png" alt="Controle financeiro moderno" />
        </div>
      </header>
    </div>
  );
}

export default Login;