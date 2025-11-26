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

  const sendData = async (e) => {
    e.preventDefault();

    if (!name || !email || !phone || !username || !password) {
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

    const body = { nombre: name, email, telefono: phone, username, password };

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
      <main className="signup-hero">

        {/* ====== NAVBAR SUPERIOR ====== */}
        <header className="signup-header">
          <div className="signup-header-inner">
            <Link to="/" className="signup-logo">
              Thrifty <span>Tally</span>
            </Link>

            <nav className="signup-nav">
              <Link to="/" className="signup-nav-link">Inicio</Link>
              <Link to="/login" className="signup-nav-link signup-nav-cta">
                Iniciar sesión
              </Link>
            </nav>
          </div>
        </header>

        <div className="signup-stage">

          {/* ====== DECORACIONES FLOTANTES ====== */}

          {/* Monedas */}
          <img
            src="/img/moneda-login.png"
            alt=""
            className="signup-float signup-coin signup-coin--1"
            aria-hidden="true"
          />
          <img
            src="/img/moneda-login.png"
            alt=""
            className="signup-float signup-coin signup-coin--2"
            aria-hidden="true"
          />
          <img
            src="/img/moneda-login.png"
            alt=""
            className="signup-float signup-coin signup-coin--3"
            aria-hidden="true"
          />

          {/* Gráfica */}
          <img
            src="/img/grafica.png"
            alt=""
            className="signup-float signup-chart"
            aria-hidden="true"
          />

          {/* Alcancía */}
          <img
            src="/img/alcancia.png"
            alt=""
            className="signup-float signup-piggy"
            aria-hidden="true"
          />

          {/* Mochila */}
          <img
            src="/img/bolso.png"
            alt=""
            className="signup-float signup-backpack"
            aria-hidden="true"
          />

          {/* ====== CARD DE REGISTRO ====== */}
          <form onSubmit={sendData} className="signup-card">
            <div className="signup-brand">
              Thrifty <span>Tally</span>
            </div>

            <h2 className="signup-title">Crea tu cuenta</h2>
            <p className="signup-subtitle">
              Organiza tus gastos universitarios en minutos.
            </p>

            <div className="signup-field">
              <label htmlFor="name">Nombre completo</label>
              <input
                type="text"
                id="name"
                placeholder="Ingresa tu nombre completo"
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
                placeholder="Ingresa tu correo electrónico"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="signup-field">
              <label htmlFor="phone">Teléfono</label>
              <input
                type="tel"
                id="phone"
                placeholder="Ingresa tu número de teléfono"
                maxLength={12}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="signup-field">
              <label htmlFor="username">Nombre de usuario</label>
              <input
                type="text"
                id="username"
                placeholder="Crea un nombre de usuario"
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
                placeholder="Crea una contraseña segura"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="signup-btn">
              Crear cuenta
            </button>

            <div className="signup-footer">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="signup-link">
                Inicia sesión
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Toaster />
    </>
  );
};

export default ViewSignup;
