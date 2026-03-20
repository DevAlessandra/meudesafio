import { useState } from "react";
import "./logincss.css";

function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Conta criada com sucesso!");
        window.location.href = "/login";
      } else {
        alert(data.erro || "Erro ao cadastrar");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor");
    }
  }

  return (
    <div className="login-container">
      {/* Cabeçalho estilo landing page */}
      <header className="hero">
        <div className="hero-text">
          <h1> 💰 Organizze</h1>
          <h2>Crie sua conta</h2>
          <p>Comece agora a organizar sua vida financeira.</p>

          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <button type="submit">Criar conta</button>
          </form>

          <p style={{ marginTop: "10px" }}>
            Já tem conta? <a href="/login">Entrar</a>
          </p>
        </div>

        <div className="hero-image">
          <img src="/Imagem.png" alt="Controle financeiro moderno" />
        </div>
      </header>
    </div>
  );
}


export default Cadastro;