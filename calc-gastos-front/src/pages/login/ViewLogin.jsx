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
      const idEstudiante = response.idEstudiante;

      try {
        localStorage.setItem("idEstudiante", String(idEstudiante));
      } catch {}

      toast.success("Inicio de sesión exitoso");
      setTimeout(() => {
        navigate("/home", { state: { idEstudiante } });
      }, 800);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      toast.error(error.mensaje || "Error al iniciar sesión");
    }
  };

  return (
    <>
      <main className="login-hero">
        {/* ====== NAVBAR SUPERIOR (igual que signup) ====== */}
        <header className="login-header">
          <div className="login-header-inner">
            <Link to="/" className="login-logo">
              Thrifty <span>Tally</span>
            </Link>

            <nav className="login-nav">
              <Link to="/" className="login-nav-link">Inicio</Link>
              <Link to="/signup" className="login-nav-link login-nav-cta">
                Regístrate
              </Link>
            </nav>
          </div>
        </header>

        {/* ====== STAGE ====== */}
        <div className="login-stage">
          <div className="login-grid">
            {/* Columna izquierda: card de login */}
            <div className="login-col">
              <div className="login-card">
                <div className="login-brand">
                  Thrifty <span>Tally</span>
                </div>

                <h2 className="login-title">Iniciar sesión</h2>
                <p className="login-subtitle">
                  Gestiona tu presupuesto universitario de forma simple y clara.
                </p>

                <form onSubmit={handleLogin} className="mt-4">
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label login-label">
                      Nombre de usuario
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="form-control login-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ingresa tu nombre de usuario"
                      autoComplete="username"
                    />
                  </div>

                  <div className="mb-2">
                    <label htmlFor="password" className="form-label login-label">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control login-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="d-flex justify-content-end mb-3">
                    <Link to="/recover-password" className="login-link-small">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 btn-lg login-btn"
                  >
                    Iniciar sesión
                  </button>
                </form>

                <div className="text-center mt-4 login-footer">
                  ¿No tienes una cuenta?{" "}
                  <Link to="/signup" className="login-link">
                    Regístrate
                  </Link>
                </div>
              </div>
            </div>

            {/* Columna derecha: ilustración + monedas flotantes */}
            <div className="login-col login-col-visual">
              <div className="login-visual">
                {/* halo difuminado de fondo */}
                <div className="login-visual-blur" aria-hidden="true"></div>

                {/* monedas flotantes alrededor del personaje */}
                <img
                  src="/img/moneda-login.png"
                  alt=""
                  aria-hidden="true"
                  className="login-float login-coin login-coin--1"
                />
                <img
                  src="/img/moneda-login.png"
                  alt=""
                  aria-hidden="true"
                  className="login-float login-coin login-coin--2"
                />
                <img
                  src="/img/moneda-login.png"
                  alt=""
                  aria-hidden="true"
                  className="login-float login-coin login-coin--3"
                />

                {/* ilustración principal */}
                <img
                  src="/img/login.png"
                  alt="Estudiante organizando sus finanzas"
                  className="login-illustration"
                />

                {/* textos de apoyo */}
                <h3 className="login-visual-title">Tu presupuesto, bajo control</h3>
                <p className="login-visual-text">
                  Inicia sesión para registrar gastos, definir metas y visualizar tu progreso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toaster />
    </>
  );
};

export default ViewLogin;