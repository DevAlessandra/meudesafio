import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./logincss.css";

function Login() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome,email, senha }),
      });

      const data = await res.json();

      if (res.ok) {
        // 🔥 salva token + usuário no contexto
        login(data);

        // 🚀 redireciona sem reload
        navigate("/");
      } else {
        alert(data.erro || "Erro ao fazer login");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <header className="hero">
        
        {/* TEXTO */}
        <div className="hero-text">
          <h1>💰 Organizze</h1>
          <h2>Bem-vindo de volta</h2>
          <p>Acesse sua conta e continue cuidando das suas finanças.</p>

          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
           
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>

          </form>

          <p style={{ marginTop: "10px" }}>
            Não tem conta?{" "}
            <Link to="/cadastro">Criar conta</Link>
          </p>
        </div>

        {/* IMAGEM */}
        <div className="hero-image">
          <img src="/Imagem.png" alt="Controle financeiro moderno" />
        </div>

      </header>
    </div>
  );
}

export default Login;