import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getData } from "../../api/api";
import Navbar from "../../components/navbar/Navbar";
import "./home.css";

const ViewHome = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [idEstudiante] = useState(() => {
    const fromState = location.state?.idEstudiante;
    let fromStorage = null;
    try { fromStorage = localStorage.getItem("idEstudiante"); } catch {}
    return fromState ?? fromStorage ?? null;
  });

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getData(`estudiantes/${idEstudiante}`);
        setUserData(data);
      } catch (err) {
        setError("Error al obtener los datos del usuario.");
      } finally {
        setLoading(false);
      }
    };

    if (idEstudiante && idEstudiante !== -2 && idEstudiante !== "-2") {
      fetchUserData();
    } else {
      setLoading(false);
      setUserData(null);
    }
  }, [idEstudiante]);

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
            <h3 className="home2-error-title">Ocurrió un problema</h3>
            <p className="home2-error-text">{error}</p>
            <button
              className="btn btn-primary w-100 btn-lg home2-btn"
              onClick={() => navigate("/login")}
            >
              Ir a iniciar sesión
            </button>
          </div>
        </main>
      </>
    );
  }

  const getIdE = () => {
    let idFromStorage = null;
    try { idFromStorage = localStorage.getItem("idEstudiante"); } catch {}
    return (
      (idFromStorage && String(idFromStorage).trim()) ||
      (userData?.data?.idEstudiante ? String(userData.data.idEstudiante) : "")
    );
  };

  const toDashboard = () => {
    navigate("/dashboard", { state: { userData } });
  };

  const toCreateGasto = () => {
    const idE = getIdE();
    if (idE) {
      try { localStorage.setItem("idEstudiante", String(idE)); } catch {}
      navigate("/crear-gasto", { state: { idUsuario: String(idE) } });
    } else {
      navigate("/crear-gasto");
    }
  };

  const toCompareBudgets = () => {
    const idE = getIdE();
    if (idE) {
      try { localStorage.setItem("idEstudiante", String(idE)); } catch {}
      navigate("/comparar-presupuestos", {
        state: { idUsuario: String(idE), idEstudiante: String(idE) },
      });
    } else {
      navigate("/comparar-presupuestos");
    }
  };

  const toPrediction = () => {
    const idE = getIdE();
    if (idE) {
      try { localStorage.setItem("idEstudiante", String(idE)); } catch {}
      navigate("/prediccion-necesidades", {
        state: { idUsuario: String(idE), idEstudiante: String(idE) },
      });
    } else {
      navigate("/prediccion-necesidades");
    }
  };

  const nombre = userData?.data?.nombre ?? "";
  const userForNavbar = userData?.data ?? { nombre: "" };

  return (
    <>
      {/* NAVBAR AISLADA DEL LAYOUT DEL HOME */}
      <header className="home2-nav">
        <Navbar userName={userForNavbar} />
      </header>

      <main className="home2-hero">
        <div className="home2-stage">
          <div className="home2-grid">

            {/* Izquierda */}
            <section className="home2-left">
              <div className="home2-pill">PANEL PRINCIPAL</div>

              <h1 className="home2-title">
                Bienvenido de nuevo{nombre ? `, ${nombre}` : ""}
              </h1>

              <p className="home2-subtitle">
                Gestiona tu presupuesto universitario de forma simple.
                Elige una acción para continuar.
              </p>
            </section>

            {/* Derecha */}
            <aside className="home2-right">
              <div className="home2-quick-card">
                <h3 className="home2-quick-title">Atajos rápidos</h3>
                <ul className="home2-quick-list">
                  <li>Registra un gasto en segundos.</li>
                  <li>Revisa el historial mensual.</li>
                  <li>Compara presupuestos y ajusta metas.</li>
                </ul>
              </div>
            </aside>

            {/* Acciones */}
            <section className="home2-actions">
              <button className="home2-action-card blue" onClick={toDashboard}>
                <div className="home2-action-icon">
                  <img src="/view.png" alt="Ver gastos creados" />
                </div>
                <div className="home2-action-text">
                  <h3>Ver gastos creados</h3>
                  <p>Consulta tu historial y filtra por mes o categoría.</p>
                </div>
                <span className="home2-action-chevron">›</span>
              </button>

              <button className="home2-action-card teal" onClick={toCreateGasto}>
                <div className="home2-action-icon">
                  <img src="/add.png" alt="Crear nuevo gasto" />
                </div>
                <div className="home2-action-text">
                  <h3>Crear nuevo gasto</h3>
                  <p>Registra rápidamente un gasto para mantener control.</p>
                </div>
                <span className="home2-action-chevron">›</span>
              </button>

              <button className="home2-action-card yellow" onClick={toCompareBudgets}>
                <div className="home2-action-icon">
                  <img src="/view.png" alt="Comparar presupuestos" />
                </div>
                <div className="home2-action-text">
                  <h3>Comparar presupuestos</h3>
                  <p>Evalúa asignado vs. gastado y detecta desbalances.</p>
                </div>
                <span className="home2-action-chevron">›</span>
              </button>

              <button className="home2-action-card blue2" onClick={toPrediction}>
                <div className="home2-action-icon">
                  <img src="/view.png" alt="Predicción de necesidades" />
                </div>
                <div className="home2-action-text">
                  <h3>Predicción de necesidades</h3>
                  <p>Anticipa tus gastos prioritarios con base en tu histórico.</p>
                </div>
                <span className="home2-action-chevron">›</span>
              </button>
            </section>

          </div>
        </div>
      </main>
    </>
  );
};

export default ViewHome;
