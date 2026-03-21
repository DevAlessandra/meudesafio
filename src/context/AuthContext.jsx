import {  useState } from "react";




function initializeUsuario() {
  const user = localStorage.getItem("usuario");
  if (user && user !== "undefined") {
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error("Erro ao parsear usuário:", error);
      localStorage.removeItem("usuario");
    }
  }
  return null;
}

export function AuthProvider({ children }) {
const [token, setToken] = useState(localStorage.getItem("token"));
  const [usuario, setUsuario] = useState(initializeUsuario());

  function login(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    setToken(data.token);
    setUsuario(data.usuario);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}