import { Link } from "react-router-dom";
import "./inicio.css";

const ViewInicio = () => {
  return (
    <>
      {/* HEADER */}
      <header className="home-header">
        <div className="container d-flex align-items-center justify-content-between">
          <div className="home-logo">
            Thrifty <span>Tally</span>
          </div>

          <nav className="home-nav d-none d-md-flex align-items-center gap-4">
            <a href="#como-funciona" className="home-nav-link">
              Cómo funciona
            </a>
            <a href="#beneficios" className="home-nav-link">
              Beneficios
            </a>
            <Link to="/login" className="btn btn-outline-primary btn-sm home-nav-cta">
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO PRINCIPAL */}
      <main className="home-hero">
        <div className="container">
          <div className="row align-items-center">
            {/* Columna izquierda: texto y botones */}
            <div className="col-lg-6 mb-5 mb-lg-0">
              <span className="home-chip">Finanzas para estudiantes</span>

              <h1 className="home-title">
                Tu compañero financiero
                <br />
                universitario
              </h1>

              <p className="home-subtitle">
                Una herramienta diseñada para estudiantes universitarios que te
                ayuda a organizar tus necesidades, planificar tu presupuesto y
                tomar decisiones financieras más inteligentes para que puedas
                enfocarte en tus estudios.
              </p>

              <div className="d-flex flex-wrap gap-3 mt-3">
                <Link
                  to="/login"
                  className="btn btn-primary btn-lg home-btn-main"
                >
                  Inicia sesión
                </Link>

                <Link
                  to="/signup"
                  className="btn btn-outline-primary btn-lg home-btn-secondary"
                >
                  Regístrate
                </Link>
              </div>

              <ul className="home-benefits" id="beneficios">
                <li>✔ Control de gastos mes a mes</li>
                <li>✔ Clasificación de necesidades prioritarias</li>
                <li>✔ Visualización clara de tu presupuesto disponible</li>
              </ul>
            </div>

            {/* Columna derecha: personajes + tarjeta + burbujas */}
            <div className="col-lg-5 offset-lg-1">
              <div className="hero-visual">
                {/* Dos personajes */}
                <div className="hero-illustrations">
                  <img
                    src="/img/estudiante 1.png"
                    alt="Estudiante usando el celular"
                    className="hero-illustration hero-illustration--boy"
                  />
                  <img
                    src="/img/estudiante 2.png"
                    alt="Estudiante usando su laptop"
                    className="hero-illustration hero-illustration--girl"
                  />
                </div>

                {/* Tarjeta de resumen flotando */}
                <div className="hero-card hero-card--floating">
                  <p className="hero-card-label">Resumen mensual</p>
                  <p className="hero-card-amount">$ 450.000</p>

                  <div className="hero-card-line">
                    <span>Asignado</span>
                    <span>$ 1.000.000</span>
                  </div>
                  <div className="hero-card-line">
                    <span>Gastado</span>
                    <span>$ 550.000</span>
                  </div>
                  <div className="hero-card-line">
                    <span>Disponible</span>
                    <span>$ 450.000</span>
                  </div>
                </div>

                {/* Burbujas flotantes */}
                <div className="hero-bubble hero-bubble--1 hero-bubble--floating">
                  Comida
                </div>
                <div className="hero-bubble hero-bubble--2 hero-bubble--floating">
                  Transporte
                </div>
                <div className="hero-bubble hero-bubble--3 hero-bubble--floating">
                  Ahorro
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FRANJA DE BENEFICIOS RÁPIDOS */}
      <section className="home-stats" id="como-funciona">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="home-stat-card">
                <p className="home-stat-label">1. Registra tus necesidades</p>
                <p className="home-stat-text">
                  Define qué gastos son realmente importantes para tu día a día
                  universitario.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="home-stat-card">
                <p className="home-stat-label">2. Crea un presupuesto claro</p>
                <p className="home-stat-text">
                  Asigna montos a cada categoría y visualiza cuánto puedes gastar
                  sin excederte.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="home-stat-card">
                <p className="home-stat-label">3. Toma mejores decisiones</p>
                <p className="home-stat-text">
                  Observa tu resumen mensual y ajusta tus hábitos financieros a
                  tiempo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewInicio;
