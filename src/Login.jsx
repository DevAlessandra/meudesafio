import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./logincss.css";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
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