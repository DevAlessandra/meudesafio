import { useState } from "react";
import "./logincss.css";
import organizeImg from "/organizze.jpg";

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
      <h1>Bem-vindo ao Controle Financeiro</h1>
<img src={organizeImg} alt="Controle financeiro" className="login-img" />      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          placeholder="Digite seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;