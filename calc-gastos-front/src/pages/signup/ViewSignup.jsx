import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { getData, postData } from "../../api/api";
import "./signup.css";

const ViewSignup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("ESTUDIANTE");

  const sendData = async (e) => {
    e.preventDefault();

    if (!name || !email || !phone || !username || !password || !tipoUsuario) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    try {
      const existeUsuarioResponse = await getData(`usuarios/existe/${username}`);
      if (existeUsuarioResponse.data === true) {
        toast.error(
          "El nombre de usuario ya existe. Si tiene una cuenta, inicie sesión"
        );
        return;
      }
    } catch (error) {
      console.error("Error al verificar usuario:", error);
      toast.error(error.message || "Error al verificar usuario");
      return;
    }

    const body = { nombre: name, email, telefono: phone, username, password, tipoUsuario };

    try {
      await postData("estudiantes/", body);
      toast.success("Usuario creado exitosamente");
      setTimeout(() => {
        navigate("/login", { state: { username } });
      }, 800);
    } catch (error) {
      console.error("Error al crear usuario:", error);
      toast.error(error.message || "Error al crear usuario");
    }
  };

  return (
    <>
      <main className="signup-page">
        <section className="signup-visual">
          <div className="signup-visual-blur"></div>
          <div className="signup-visual-content">
            <h2 className="signup-visual-title">
              Toma el control de tu dinero
            </h2>
            <p className="signup-visual-text">
              Gestiona tus finanzas de manera simple, inteligente y visual.
              Para estudiantes, independientes, empresarios y trabajadores.
            </p>
            <div className="signup-visual-cards">
              <div className="signup-mini-card">
                <div className="signup-mini-icon">🎯</div>
                <div className="signup-mini-text">
                  <strong>Control total</strong>
                  <small>Monitorea ingresos y gastos</small>
                </div>
              </div>
              <div className="signup-mini-card">
                <div className="signup-mini-icon">📊</div>
                <div className="signup-mini-text">
                  <strong>Reportes visuales</strong>
                  <small>Gráficas y análisis</small>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="signup-form-section">
          <div className="signup-form-wrapper">
            <header className="signup-top-nav">
              <Link to="/" className="signup-top-logo">
                Thrifty <span>Tally</span>
              </Link>
              <div className="signup-top-actions">
                <Link to="/" className="signup-top-home-btn">
                  Home
                </Link>
                <span className="signup-top-hint">¿Ya tienes cuenta?</span>
                <Link to="/login" className="signup-top-btn">
                  Inicia sesión
                </Link>
              </div>
            </header>

            <div className="signup-form-card">
              <h1 className="signup-form-title">
                Crea tu cuenta en segundos
              </h1>
              <p className="signup-form-subtitle">
                Empieza hoy mismo a organizar tu economía personal.
              </p>

              <form onSubmit={sendData} className="signup-form">
                <div className="signup-field-group">
                  <div className="signup-field">
                    <label htmlFor="name">Nombre completo</label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Tu nombre"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="signup-field">
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                      type="email"
                      id="email"
                      placeholder="tu@ejemplo.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="signup-field-group">
                  <div className="signup-field">
                    <label htmlFor="phone">Teléfono</label>
                    <input
                      type="tel"
                      id="phone"
                      placeholder="+52 123 456 7890"
                      maxLength={15}
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="signup-field">
                    <label htmlFor="tipoUsuario">Tipo de usuario</label>
                    <select
                      id="tipoUsuario"
                      value={tipoUsuario}
                      onChange={(e) => setTipoUsuario(e.target.value)}
                      required
                    >
                      <option value="ESTUDIANTE">Estudiante</option>
                      <option value="INDEPENDIENTE">Independiente</option>
                      <option value="EMPRESARIO">Empresario</option>
                      <option value="TRABAJADOR">Trabajador</option>
                    </select>
                  </div>
                </div>
                <div className="signup-field-group">
                  <div className="signup-field">
                    <label htmlFor="username">Nombre de usuario</label>
                    <input
                      type="text"
                      id="username"
                      placeholder="ej: tu_nombre"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="signup-field">
                    <label htmlFor="password">Contraseña</label>
                    <input
                      type="password"
                      id="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="signup-submit-btn">
                  Crear cuenta gratis
                </button>
              </form>

              <p className="signup-form-footer">
                Al registrarte aceptas nuestros términos y condiciones.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Toaster />
    </>
  );
};

export default ViewSignup;
