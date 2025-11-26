// src/components/navbar/Navbar.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleEdit = () => {
    navigate("/editar-datos", { state: { ...location.state } });
  };

  const handleHome = () => {
    navigate("/home", { state: { ...location.state } });
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Marca de la aplicación a la IZQUIERDA */}
        <div className="navbar-brand">
          Thrifty <span>Tally</span>
        </div>

        {/* Botones a la DERECHA */}
        <div className="navbar-right">
          <button
            type="button"
            className="nav-btn nav-btn-outline"
            onClick={handleEdit}
          >
            Editar datos
          </button>

          <button
            type="button"
            className="nav-btn nav-btn-secondary"
            onClick={handleHome}
          >
            Home
          </button>

          <button
            type="button"
            className="nav-btn nav-btn-danger"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
