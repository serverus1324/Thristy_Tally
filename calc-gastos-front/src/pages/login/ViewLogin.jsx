import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { postData } from "../../api/api";
import "./login.css";

const ViewLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (username === "" || password === "") {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    try {
      const body = { username, password };
      const response = await postData("usuarios/login", body);
      const idPerfil = response.idPerfil;

        try {
          localStorage.setItem('idPerfil', String(idPerfil));
        } catch {}

        toast.success("Inicio de sesión exitoso");
        setTimeout(() => {
          navigate("/home", { state: { idPerfil } });
      }, 800);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      toast.error(error.mensaje || "Error al iniciar sesión");
    }
  };

  return (
    <>
      <main className="login-page">
        <section className="login-visual">
          <div className="login-visual-blur"></div>
          <div className="login-visual-content">
            <h2 className="login-visual-title">
              Bienvenido de vuelta
            </h2>
            <p className="login-visual-text">
              Continúa organizando tus finanzas, seguimiento de tus metas y mantén el control de tu economía.
            </p>
            <div className="login-visual-cards">
              <div className="login-mini-card">
                <div className="login-mini-icon">💰</div>
                <div className="login-mini-text">
                  <strong>Gestiona tus gastos</strong>
                  <small>Registra y categoriza</small>
                </div>
              </div>
              <div className="login-mini-card">
                <div className="login-mini-icon">🎯</div>
                <div className="login-mini-text">
                  <strong>Alcanza tus metas</strong>
                  <small>Seguimiento en tiempo real</small>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="login-form-section">
          <div className="login-form-wrapper">
            <header className="login-top-nav">
              <Link to="/" className="login-top-logo">
                Thrifty <span>Tally</span>
              </Link>
              <div className="login-top-actions">
                <Link to="/" className="login-top-home-btn">
                  Home
                </Link>
                <span className="login-top-hint">¿No tienes cuenta?</span>
                <Link to="/signup" className="login-top-btn">
                  Regístrate
                </Link>
              </div>
            </header>

            <div className="login-form-card">
              <h1 className="login-form-title">
                Inicia sesión
              </h1>
              <p className="login-form-subtitle">
                Ingresa tus credenciales para acceder a tu panel.
              </p>

              <form onSubmit={handleLogin} className="login-form">
                <div className="login-field">
                  <label htmlFor="username">Nombre de usuario</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="tu_nombre"
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="login-field">
                  <label htmlFor="password">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <div className="login-forgot-wrapper">
                  <Link to="/recover-password" className="login-forgot-link">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <button type="submit" className="login-submit-btn">
                  Iniciar sesión
                </button>
              </form>

              <p className="login-form-footer">
                ¿No tienes cuenta?{" "}
                <Link to="/signup" className="login-footer-link">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Toaster />
    </>
  );
};

export default ViewLogin;
