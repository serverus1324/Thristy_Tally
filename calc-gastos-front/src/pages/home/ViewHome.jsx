import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getData } from "../../api/api";
import Navbar from "../../components/navbar/Navbar";
import "./home.css";

const ViewHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTipsSidebar, setShowTipsSidebar] = useState(false);

  const [idPerfil] = useState(() => {
    const fromState = location.state?.idPerfil;
    let fromStorage = null;
    try { fromStorage = localStorage.getItem('idPerfil'); } catch {}
    return fromState ?? fromStorage ?? null;
  });

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getData(`estudiantes/${idPerfil}`);
        setUserData(data);
      } catch (err) {
        setError(err.message || "No se pudieron cargar los datos del perfil.");
      } finally {
        setLoading(false);
      }
    };

    if (/^[a-f\d]{24}$/i.test(String(idPerfil ?? ""))) {
      fetchUserData();
    } else {
      setError("Esta cuenta no tiene un perfil válido asociado. Inicia sesión con una cuenta registrada.");
      setLoading(false);
    }
  }, [idPerfil]);

  if (loading) {
    return (
      <>
        <header className="home2-nav">
          <Navbar userName={{ nombre: "" }} />
        </header>

        <main className="home2-hero">
          <div className="home2-state">
            <div className="home2-spinner" />
            <p>Cargando datos del usuario...</p>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header className="home2-nav">
          <Navbar userName={{ nombre: "" }} />
        </header>
        <main className="home2-hero">
          <div className="home2-state">
            <h3 className="home2-error-title">No se pudieron cargar tus datos</h3>
            <p className="home2-error-text">{error}</p>
            <button
              className="btn btn-primary w-100 btn-lg home2-btn"
              onClick={() => navigate("/login")}
            >
              Volver a iniciar sesión
            </button>
          </div>
        </main>
      </>
    );
  }

  const getIdE = () => {
    let idFromStorage = null;
    try { idFromStorage = localStorage.getItem("idPerfil"); } catch {}
    return (
      (idFromStorage && String(idFromStorage).trim()) ||
      (userData?.data?.idPerfil ? String(userData.data.idPerfil) : "")
    );
  };

  const toDashboard = () => {
    navigate("/dashboard", { state: { userData } });
  };

  const toCreateGasto = () => {
    const idE = getIdE();
    if (idE) {
      try { localStorage.setItem("idPerfil", String(idE)); } catch {}
      navigate("/crear-gasto", { state: { idUsuario: String(idE) } });
    } else {
      navigate("/crear-gasto");
    }
  };

  const toCompareBudgets = () => {
    const idE = getIdE();
    if (idE) {
      try { localStorage.setItem("idPerfil", String(idE)); } catch {}
      navigate("/comparar-presupuestos", {
        state: { idUsuario: String(idE), idPerfil: String(idE) },
      });
    } else {
      navigate("/comparar-presupuestos");
    }
  };

  const toPrediction = () => {
    const idE = getIdE();
    if (idE) {
      try { localStorage.setItem("idPerfil", String(idE)); } catch {}
      navigate("/prediccion-necesidades", {
        state: { idUsuario: String(idE), idPerfil: String(idE) },
      });
    } else {
      navigate("/prediccion-necesidades");
    }
  };

  const nombre = userData?.data?.nombre ?? "";
  const tipoUsuario = userData?.data?.tipoUsuario ?? "";
  const userForNavbar = userData?.data ?? { nombre: "" };
  
  const getTipoUsuarioLabel = (tipo) => {
    switch (tipo) {
      case "ESTUDIANTE": return "Estudiante";
      case "INDEPENDIENTE": return "Independiente";
      case "EMPRESARIO": return "Empresario";
      case "TRABAJADOR": return "Trabajador";
      default: return "";
    }
  };

  return (
    <>
      <header className="home2-nav">
        <Navbar userName={userForNavbar} />
      </header>

      <main className="home2-hero">
        <div className="home2-bg-glow-1"></div>
        <div className="home2-bg-glow-2"></div>

        <div className="home2-stage">
          {/* TOP ROW - Welcome + Quick Summary */}
          <div className="home2-top-row">
            {/* Welcome Card */}
            <div className="home2-welcome-card">
              <div className="home2-pill">
                <span className="home2-pill-dot"></span>
                Panel Principal
              </div>
              <h1 className="home2-title">
                Bienvenido de nuevo<span className="home2-title-emoji">👋</span>
                {nombre && <span className="home2-name">{`, ${nombre}`}</span>}
              </h1>
              {tipoUsuario && (
                <div className="home2-user-badge">
                  <div className="home2-user-icon"></div>
                  <span>{getTipoUsuarioLabel(tipoUsuario)}</span>
                </div>
              )}
              <p className="home2-subtitle">
                Gestiona tu presupuesto de forma simple y organizada.
              </p>
            </div>

            {/* Summary Card */}
            <div className="home2-summary-card">
              <div className="home2-summary-header">
                <h3>Resumen rápido del mes</h3>
                <span className="home2-summary-badge">En curso</span>
              </div>
              <div className="home2-summary-stats-horizontal">
                <div className="home2-summary-stat-small">
                  <div className="home2-summary-stat-icon-small blue"></div>
                  <div className="home2-summary-stat-content-small">
                    <p className="home2-summary-stat-label-small">Total Asignado</p>
                    <h4 className="home2-summary-stat-value-small">$0.00</h4>
                  </div>
                </div>
                <div className="home2-summary-stat-small">
                  <div className="home2-summary-stat-icon-small red"></div>
                  <div className="home2-summary-stat-content-small">
                    <p className="home2-summary-stat-label-small">Total Gastado</p>
                    <h4 className="home2-summary-stat-value-small">$0.00</h4>
                  </div>
                </div>
                <div className="home2-summary-stat-small">
                  <div className="home2-summary-stat-icon-small green"></div>
                  <div className="home2-summary-stat-content-small">
                    <p className="home2-summary-stat-label-small">Disponible</p>
                    <h4 className="home2-summary-stat-value-small">$0.00</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW - Action Cards Grid */}
          <div className="home2-actions-grid-section">
            <div className="home2-actions-grid">
              <button className="home2-action-card blue" onClick={toDashboard}>
                <div className="home2-action-bg"></div>
                <div className="home2-action-icon-wrap">
                  <div className="home2-action-icon">📊</div>
                </div>
                <div className="home2-action-text">
                  <h3>Ver gastos creados</h3>
                  <p>Consulta tu historial y filtra por mes o categoría</p>
                </div>
                <div className="home2-action-chevron">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </button>

              <button className="home2-action-card teal" onClick={toCreateGasto}>
                <div className="home2-action-bg"></div>
                <div className="home2-action-icon-wrap">
                  <div className="home2-action-icon">➕</div>
                </div>
                <div className="home2-action-text">
                  <h3>Crear nuevo gasto</h3>
                  <p>Registra rápidamente un gasto para mantener control</p>
                </div>
                <div className="home2-action-chevron">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </button>

              <button className="home2-action-card orange" onClick={toCompareBudgets}>
                <div className="home2-action-bg"></div>
                <div className="home2-action-icon-wrap">
                  <div className="home2-action-icon">📈</div>
                </div>
                <div className="home2-action-text">
                  <h3>Comparar presupuestos</h3>
                  <p>Evalúa asignado vs gastado y detecta desbalances</p>
                </div>
                <div className="home2-action-chevron">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </button>

              <button className="home2-action-card purple" onClick={toPrediction}>
                <div className="home2-action-bg"></div>
                <div className="home2-action-icon-wrap">
                  <div className="home2-action-icon">🔮</div>
                </div>
                <div className="home2-action-text">
                  <h3>Predicción de necesidades</h3>
                  <p>Anticipa tus gastos prioritarios con base en tu histórico</p>
                </div>
                <div className="home2-action-chevron">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Quick Tips Button */}
        <button 
          className="home2-floating-tips-btn"
          onClick={() => setShowTipsSidebar(!showTipsSidebar)}
        >
          <span>💡</span>
        </button>

        {/* Quick Tips Sidebar */}
        <div className={`home2-tips-sidebar-overlay ${showTipsSidebar ? 'active' : ''}`}>
          <div className={`home2-tips-sidebar-panel ${showTipsSidebar ? 'active' : ''}`}>
            <div className="home2-tips-sidebar-header">
              <h3>💡 Consejos rápidos</h3>
              <button 
                className="home2-tips-sidebar-close"
                onClick={() => setShowTipsSidebar(false)}
              >
                ✕
              </button>
            </div>
            <div className="home2-tips-list">
              <div className="home2-tip-item">
                <div className="home2-tip-icon-wrapper">
                  <span className="home2-tip-emoji">📝</span>
                </div>
                <div className="home2-tip-text">
                  <h4>Registra gastos diariamente</h4>
                  <p>Evita sorpresas al final del mes</p>
                </div>
              </div>
              <div className="home2-tip-item">
                <div className="home2-tip-icon-wrapper">
                  <span className="home2-tip-emoji">🎯</span>
                </div>
                <div className="home2-tip-text">
                  <h4>Prioriza necesidades</h4>
                  <p>Foco en lo realmente importante</p>
                </div>
              </div>
              <div className="home2-tip-item">
                <div className="home2-tip-icon-wrapper">
                  <span className="home2-tip-emoji">📉</span>
                </div>
                <div className="home2-tip-text">
                  <h4>Revisa tu progreso</h4>
                  <p>Semanalmente revisa tus estadísticas</p>
                </div>
              </div>
              <div className="home2-tip-item">
                <div className="home2-tip-icon-wrapper">
                  <span className="home2-tip-emoji">💰</span>
                </div>
                <div className="home2-tip-text">
                  <h4>Ahorra constantemente</h4>
                  <p>Pequeños ahorros generan grandes cambios</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ViewHome;
