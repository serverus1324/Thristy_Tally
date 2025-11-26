import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getData, deleteData, putData } from '../../api/api';
import Navbar from '../../components/navbar/Navbar';
import "./dashboard.css";

const SimpleGastosTable = ({
  gastos,
  accionActual,
  onStartEliminar,
  onStartAumentar,
  onConfirmDelete,
  onCancelAction,
  onApplyIncrease,
  onChangeIncreaseValue
}) => {
  if (!gastos || gastos.length === 0) {
    return <p className="text-center text-muted mt-3">No hay necesidades registradas para este período.</p>;
  }

  return (
    <div className="table-responsive tt-table-wrap">
      <table className="table tt-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Monto Solicitado</th>
            <th>Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {gastos.map((gasto, idx) => {
            const nombre = gasto?.nombre || gasto?.descripcion || '—';
            const descripcion = gasto?.descripcion || gasto?.nombre || '—';
            const montoBase = gasto?.monto ?? gasto?.montoSolicitado;
            const monto = montoBase != null ? Number(montoBase).toFixed(2) : '0.00';
            const estado = typeof gasto?.esPredeterminada === 'number'
              ? (gasto.esPredeterminada === 1 ? 'Predeterminada' : 'Establecida')
              : (gasto?.estado || '—');

            const gid = gasto.id || gasto._id || idx;

            return (
              <tr key={gid}>
                <td>{nombre}</td>
                <td className="text-muted">{descripcion}</td>
                <td className="fw-semibold">${monto}</td>
                <td>{estado}</td>

                <td className="text-center">
                  {accionActual && accionActual.id === (gasto.id || gasto._id) ? (
                    accionActual.mode === 'delete' ? (
                      <div className="d-flex gap-2 justify-content-center">
                        <button className="btn btn-sm btn-danger" onClick={onConfirmDelete}>Confirmar</button>
                        <button className="btn btn-sm btn-secondary" onClick={onCancelAction}>Cancelar</button>
                      </div>
                    ) : (
                      <div className="d-flex gap-2 align-items-center justify-content-center">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={accionActual.value ?? ''}
                          onChange={(e) => onChangeIncreaseValue(e.target.value)}
                          className="form-control form-control-sm"
                          style={{ maxWidth: '120px' }}
                          placeholder="+ monto"
                        />
                        <button className="btn btn-sm btn-warning" onClick={onApplyIncrease}>Aplicar</button>
                        <button className="btn btn-sm btn-secondary" onClick={onCancelAction}>Cancelar</button>
                      </div>
                    )
                  ) : (
                    <>
                      <button
                        className="btn btn-sm btn-danger me-2"
                        onClick={() => onStartEliminar(gasto)}
                      >
                        Eliminar
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => onStartAumentar(gasto)}
                      >
                        Aumentar valor
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const ChartPlaceholder = ({ gastos }) => {
  if (!gastos || gastos.length === 0) {
    return <p className="text-center text-muted">No hay datos suficientes para mostrar en el gráfico.</p>;
  }

  const totalGastado = gastos.reduce(
    (acc, curr) => acc + (Number(curr.monto ?? curr.montoSolicitado) || 0),
    0
  );

  return (
    <div className="tt-chart-card">
      <div className="tt-chart-header">
        <h5>Visualización de Datos</h5>
        <p className="text-muted mb-0">Total solicitado en necesidades del período.</p>
      </div>

      <div className="tt-chart-total">
        ${totalGastado.toFixed(2)}
      </div>

      <p className="text-center fst-italic small text-muted mb-3">
        (Aquí se integrará el componente real de gráfico)
      </p>

      <details>
        <summary className="tt-link">Ver datos crudos</summary>
        <pre className="tt-raw">
{JSON.stringify(gastos, null, 2)}
        </pre>
      </details>
    </div>
  );
};

const ViewDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [idUsuario, setIdUsuario] = useState(null);
  const [userData, setUserData] = useState(null);
  const [necesidades, setNecesidades] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [periodosConPresupuesto, setPeriodosConPresupuesto] = useState([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState('');
  const [resumenPresupuesto, setResumenPresupuesto] = useState(null);

  const [viewStatus, setViewStatus] = useState({ loading: true, error: null });
  const [accionActual, setAccionActual] = useState(null);

  /* --- acciones Navbar --- */
  const handleGoHome = () => {
    if (!idUsuario) return;
    navigate("/home", { state: { idEstudiante: idUsuario } });
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
    } catch {}
    navigate("/login");
  };

  const handleEditProfile = () => {
    if (!idUsuario) return;
    navigate("/editar-datos", { state: { idEstudiante: idUsuario } });
  
  };

  /* 1) Resolver idUsuario */
  useEffect(() => {
    const idFromLocation = location.state?.idEstudiante ?? location.state?.userData?.data?._id;
    let idFromStorage = null;
    try { idFromStorage = localStorage.getItem('idEstudiante'); } catch {}
    const resolvedId = idFromLocation ?? idFromStorage;

    if (resolvedId) setIdUsuario(resolvedId);
    else setViewStatus({ loading: false, error: null });
  }, [location.state, navigate]);

  /* 2) Cargar usuario + periodos */
  useEffect(() => {
    if (!idUsuario) {
      setViewStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    setViewStatus({ loading: true, error: null });
    let isActive = true;

    const fetchInitialData = async () => {
      try {
        const [dataUsuarioResponse, periodosDataResponse] = await Promise.all([
          getData(`estudiantes/${idUsuario}`),
          getData(`periodos/${idUsuario}/por-estudiante`)
        ]);

        if (!isActive) return;

        setUserData(
          dataUsuarioResponse?.data
            ? dataUsuarioResponse
            : { data: { nombre: 'Estudiante Demo' } }
        );

        const periodosArray = Array.isArray(periodosDataResponse)
          ? periodosDataResponse
          : (Array.isArray(periodosDataResponse?.data) ? periodosDataResponse.data : []);
        setPeriodos(periodosArray);

        const periodosValidos = [];
        for (const periodo of periodosArray) {
          const periodoId = periodo._id ?? periodo.id ?? periodo.nombre ?? '';
          try {
            await getData(
              `necesidades/resumen-presupuesto?idEstudiante=${idUsuario}&idPeriodo=${periodoId}`
            );
            periodosValidos.push(periodo);
          } catch (err) {
            const msg = String(err?.message || '');
            if (!msg.includes('Presupuesto no encontrado')) {
              periodosValidos.push(periodo);
            }
          }
        }

        setPeriodosConPresupuesto(periodosValidos);

        if (periodosValidos.length > 0) {
          const firstPeriodoId =
            periodosValidos[0]?._id ??
            periodosValidos[0]?.id ??
            periodosValidos[0]?.nombre ??
            '';
          setSelectedPeriodo(firstPeriodoId);
        } else {
          setNecesidades([]);
          setResumenPresupuesto(null);
          setViewStatus({ loading: false, error: null });
        }
      } catch (err) {
        if (!isActive) return;
        setViewStatus({
          loading: false,
          error: `Error al obtener datos iniciales: ${err.message}`
        });
      }
    };

    fetchInitialData();
    return () => { isActive = false; };
  }, [idUsuario]);

  /* 3) Cargar necesidades + resumen por período */
  useEffect(() => {
    if (!selectedPeriodo || !idUsuario) {
      if (idUsuario && periodos.length === 0 && !viewStatus.error) {
        setViewStatus(prev => ({ ...prev, loading: false }));
      }
      return;
    }

    setViewStatus(prev => ({ ...prev, loading: true, error: null }));
    let isActive = true;

    const fetchPeriodData = async () => {
      try {
        const necesidadesDataResponse = await getData(
          `necesidades/por-estudiante-periodo?idEstudiante=${idUsuario}&idPeriodo=${selectedPeriodo}`
        );

        if (!isActive) return;

        const necesidadesArray = Array.isArray(necesidadesDataResponse)
          ? necesidadesDataResponse
          : (Array.isArray(necesidadesDataResponse?.data)
              ? necesidadesDataResponse.data
              : []);
        setNecesidades(necesidadesArray);

        try {
          const resumenDataResponse = await getData(
            `necesidades/resumen-presupuesto?idEstudiante=${idUsuario}&idPeriodo=${selectedPeriodo}`
          );
          setResumenPresupuesto(
            resumenDataResponse?.data
              ? resumenDataResponse
              : { data: resumenDataResponse }
          );
        } catch (errResumen) {
          const msg = String(errResumen?.message || '');
          if (msg.includes('Presupuesto no encontrado')) setResumenPresupuesto(null);
          else throw errResumen;
        }

        setViewStatus({ loading: false, error: null });
      } catch (err) {
        if (!isActive) return;
        setViewStatus({
          loading: false,
          error: `Error al cargar datos del período: ${err.message}`
        });
        setNecesidades([]);
        setResumenPresupuesto(null);
      }
    };

    fetchPeriodData();
    return () => { isActive = false; };
  }, [selectedPeriodo, idUsuario, periodos]);

  const handlePeriodoChange = (event) => setSelectedPeriodo(event.target.value);

  const getNecesidadesCurrentPeriodo = async () => {
    if (selectedPeriodo && idUsuario) {
      try {
        const necesidadesData = await getData(
          `necesidades/por-estudiante-periodo?idEstudiante=${idUsuario}&idPeriodo=${selectedPeriodo}`
        );
        setNecesidades(
          Array.isArray(necesidadesData?.data)
            ? necesidadesData.data
            : (Array.isArray(necesidadesData) ? necesidadesData : [])
        );
      } catch (error) {
        setViewStatus(prev => ({
          ...prev,
          error: "Error al recargar necesidades: " + error.message
        }));
      }
    }
  };

  const getResumenPresupuestoCurrentPeriodo = async () => {
    if (selectedPeriodo && idUsuario) {
      try {
        const resumenData = await getData(
          `necesidades/resumen-presupuesto?idEstudiante=${idUsuario}&idPeriodo=${selectedPeriodo}`
        );
        setResumenPresupuesto(
          resumenData?.data ? resumenData : { data: resumenData }
        );
      } catch (error) {
        const msg = String(error?.message || '');
        if (msg.includes('Presupuesto no encontrado')) setResumenPresupuesto(null);
        else {
          setViewStatus(prev => ({
            ...prev,
            error: "Error al recargar resumen: " + error.message
          }));
        }
      }
    }
  };

  const startEliminar = (necesidad) => {
    const id = necesidad.id || necesidad._id;
    if (!id) return;
    setAccionActual({ id, mode: 'delete', item: necesidad });
  };

  const confirmarEliminar = async () => {
    if (!accionActual?.id) return;
    try {
      await deleteData(`necesidades/${accionActual.id}`);
      await getNecesidadesCurrentPeriodo();
      await getResumenPresupuestoCurrentPeriodo();
    } catch (e) {
      alert('Error al eliminar necesidad: ' + (e?.message || ''));
    } finally {
      setAccionActual(null);
    }
  };

  const startAumentar = (necesidad) => {
    const id = necesidad.id || necesidad._id;
    if (!id) return;
    setAccionActual({ id, mode: 'increase', value: '', item: necesidad });
  };

  const changeIncreaseValue = (val) => {
    setAccionActual(prev => ({ ...prev, value: val }));
  };

  const applyIncrease = async () => {
    if (!accionActual?.id) return;
    const incremento = Number(accionActual.value);
    if (Number.isNaN(incremento) || incremento <= 0) {
      alert('Valor inválido. Ingrese un número mayor a 0.');
      return;
    }

    const necesidad = accionActual.item;
    const id = necesidad.id || necesidad._id;
    const montoActual = Number(necesidad.monto ?? necesidad.montoSolicitado ?? 0);
    const nuevoMonto = montoActual + incremento;

    try {
      let idEst = necesidad.idEstudiante || idUsuario || null;
      let idPer = necesidad.idPeriodo || selectedPeriodo || null;
      let idPres = necesidad.idPresupuesto || null;

      if (!idPres && idEst && idPer) {
        const presupuestoResp = await getData(
          `presupuestos/por-estudiante-periodo?idEstudiante=${idEst}&idPeriodo=${idPer}`
        );
        const p = presupuestoResp?.data || presupuestoResp;
        idPres = p?.id || p?._id || null;
      }

      const dto = {
        id,
        descripcion: necesidad.descripcion || necesidad.nombre || '',
        monto: nuevoMonto,
        esPredeterminada: typeof necesidad.esPredeterminada === 'number'
          ? necesidad.esPredeterminada
          : (necesidad.esPredeterminada ? 1 : 0),
        idEstudiante: idEst,
        idPeriodo: idPer,
        idPresupuesto: idPres
      };

      await putData('necesidades', dto);
      await getNecesidadesCurrentPeriodo();
      await getResumenPresupuestoCurrentPeriodo();
    } catch (e) {
      alert('Error al actualizar el monto: ' + (e?.message || ''));
      console.error('PUT necesidades error', e);
    } finally {
      setAccionActual(null);
    }
  };

  const cancelAction = () => setAccionActual(null);

  const aumentarPresupuesto = async () => {
    try {
      if (!idUsuario || !selectedPeriodo) {
        alert('Seleccione un período para editar el presupuesto.');
        return;
      }
      const presupuestoResp = await getData(
        `presupuestos/por-estudiante-periodo?idEstudiante=${idUsuario}&idPeriodo=${selectedPeriodo}`
      );
      const p = presupuestoResp?.data || presupuestoResp;
      const presupuestoId = p?.id || p?._id;

      if (!presupuestoId) {
        alert('No se encontró el presupuesto del período seleccionado.');
        return;
      }
      navigate(`/presupuesto/${presupuestoId}/editar`);
    } catch (e) {
      setViewStatus(prev => ({
        ...prev,
        error: 'Error al abrir edición de presupuesto: ' + e.message
      }));
      alert('No fue posible abrir la edición de presupuesto.');
    }
  };

  const porcentajeConsumido = resumenPresupuesto?.data?.porcentajeConsumido ?? 0;

  /* ===== Estados de carga/error ===== */
  if (viewStatus.loading) {
    return (
      <>
        <Navbar
          userName={userData?.data?.nombre}
          onHome={handleGoHome}
          onLogout={handleLogout}
          onEditProfile={handleEditProfile}
        />
        <main className="tt-dashboard-hero">
          <div className="tt-loading">
            <div className="spinner-border text-primary" role="status" />
            <span>Cargando datos, por favor espere...</span>
          </div>
        </main>
      </>
    );
  }

  if (viewStatus.error) {
    return (
      <>
        <Navbar
          userName={userData?.data?.nombre}
          onHome={handleGoHome}
          onLogout={handleLogout}
          onEditProfile={handleEditProfile}
        />
        <main className="tt-dashboard-hero">
          <div className="container">
            <div className="alert alert-danger text-center">
              <h4 className="alert-heading">¡Ocurrió un Error!</h4>
              <p>{viewStatus.error}</p>
              {idUsuario === null && (
                <p className="mb-0">
                  Si el problema persiste, intente{' '}
                  <a href="/login" className="alert-link">iniciar sesión</a>{' '}
                  nuevamente.
                </p>
              )}
              <button
                className="btn btn-danger mt-3"
                onClick={() => window.location.reload()}
              >
                Intentar de Nuevo
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  /* ===== Render normal ===== */
  return (
    <>
      <Navbar
        userName={userData?.data?.nombre}
        onHome={handleGoHome}
        onLogout={handleLogout}
        onEditProfile={handleEditProfile}
      />

      <main className="tt-dashboard-hero">
        <div className="tt-dashboard-stage">

          {/* ===== Header superior ===== */}
          <section className="tt-dashboard-header">
            <div className="tt-header-left">
              <span className="tt-chip">PANEL PRINCIPAL</span>

              <h1 className="tt-title">
                Panel de Control Financiero
              </h1>

              <p className="tt-subtitle">
                Bienvenido/a, {userData?.data?.nombre} {userData?.data?.apellido || ''}.
                Selecciona un período y administra tus necesidades de forma clara.
              </p>
            </div>

            <div className="tt-header-right">
              <div className="tt-quick-card">
                <h3>Atajos rápidos</h3>
                <ul>
                  <li>Visualiza tus necesidades por período.</li>
                  <li>Ajusta tu presupuesto cuando lo necesites.</li>
                  <li>Controla cuánto has consumido.</li>
                </ul>

                <button
                  className="tt-btn-outline"
                  onClick={handleGoHome}
                >
                  Ir al Home
                </button>
              </div>
            </div>
          </section>

          {/* ===== Selector de período ===== */}
          <section className="tt-card tt-card-light tt-period-card">
            <h2 className="tt-card-title">Seleccionar Período Académico</h2>

            {periodosConPresupuesto.length > 0 ? (
              <select
                className="form-select tt-select"
                value={selectedPeriodo}
                onChange={handlePeriodoChange}
                aria-label="Selector de período"
              >
                <option value="" disabled>-- Seleccione un período --</option>
                {periodosConPresupuesto.map((periodo) => {
                  const val = periodo._id ?? periodo.id ?? periodo.nombre;
                  const label = periodo.nombre ?? periodo._id ?? periodo.id;
                  return (
                    <option key={String(val)} value={String(val)}>
                      {String(label)}
                    </option>
                  );
                })}
              </select>
            ) : (
              <div className="text-center py-3">
                <p className="text-muted mb-3">No hay períodos con presupuesto disponibles.</p>
                <button
                  className="btn btn-success"
                  onClick={() => navigate('/necesidad-presupuesto', { state: { idUsuario } })}
                >
                  Crear Primer Presupuesto
                </button>
              </div>
            )}
          </section>

          {/* ===== Resumen presupuesto ===== */}
          {selectedPeriodo && resumenPresupuesto && (
            <section className="tt-card tt-resumen-card">
              <div className="tt-resumen-head">
                <h2 className="tt-card-title">
                  Resumen del Presupuesto ({resumenPresupuesto?.data?.descripcionPresupuesto || 'General'})
                </h2>

                <button onClick={aumentarPresupuesto} className="tt-btn-soft">
                  Ajustar presupuesto
                </button>
              </div>

              <div className="tt-resumen-grid">
                <div className="tt-metric">
                  <p>Total Asignado</p>
                  <h3 className="tt-metric-assign">
                    ${(resumenPresupuesto?.data?.totalAsignado || 0).toFixed(2)}
                  </h3>
                </div>

                <div className="tt-metric">
                  <p>Total Gastado</p>
                  <h3 className="tt-metric-spent">
                    ${(resumenPresupuesto?.data?.totalGastado || 0).toFixed(2)}
                  </h3>
                </div>

                <div className="tt-metric">
                  <p>Disponible</p>
                  <h3 className={`tt-metric-available ${resumenPresupuesto?.data?.disponible < 0 ? 'neg' : ''}`}>
                    ${(resumenPresupuesto?.data?.disponible || 0).toFixed(2)}
                  </h3>
                </div>
              </div>

              <div className="tt-progress-wrap">
                <div className="tt-progress-row">
                  <span>Porcentaje consumido</span>
                  <span className={`tt-badge ${
                    porcentajeConsumido > 100
                      ? 'danger'
                      : porcentajeConsumido > 80
                        ? 'warn'
                        : 'ok'
                  }`}>
                    {porcentajeConsumido.toFixed(2)}%
                  </span>
                </div>

                <div className="progress tt-progress">
                  <div
                    className={`progress-bar progress-bar-striped progress-bar-animated ${
                      porcentajeConsumido > 100
                        ? "bg-danger"
                        : porcentajeConsumido > 80
                          ? "bg-warning"
                          : "bg-success"
                    }`}
                    role="progressbar"
                    style={{ width: `${Math.min(porcentajeConsumido, 100)}%` }}
                    aria-valuenow={porcentajeConsumido}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {porcentajeConsumido.toFixed(0)}%
                  </div>
                </div>

                {porcentajeConsumido > 100 && (
                  <p className="tt-alert">
                    ¡Atención! Has excedido el presupuesto asignado.
                  </p>
                )}
              </div>
            </section>
          )}

          {selectedPeriodo && !resumenPresupuesto && (
            <section className="tt-card tt-card-light">
              <p className="mb-2 text-muted">No hay presupuesto asociado para este período.</p>
              <div className="d-flex gap-2">
                <button onClick={aumentarPresupuesto} className="btn btn-outline-primary">
                  Buscar/Editar Presupuesto
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => navigate('/necesidad-presupuesto', { state: { idUsuario, selectedPeriodo } })}
                >
                  Crear Presupuesto
                </button>
              </div>
            </section>
          )}

          {!selectedPeriodo && idUsuario && (
            <p className="text-center text-info mt-3">
              Por favor, seleccione un período para ver el resumen y las necesidades.
            </p>
          )}

          {/* ===== Necesidades + gráfico ===== */}
          {selectedPeriodo && (
            <>
              <section className="tt-card tt-card-glass mt-4">
                <div className="tt-section-head">
                  <h2>Mis Necesidades Registradas</h2>
                  <p className="text-muted mb-0">Administre sus necesidades del período seleccionado.</p>
                </div>

                <SimpleGastosTable
                  gastos={necesidades}
                  accionActual={accionActual}
                  onStartEliminar={startEliminar}
                  onStartAumentar={startAumentar}
                  onConfirmDelete={confirmarEliminar}
                  onCancelAction={cancelAction}
                  onApplyIncrease={applyIncrease}
                  onChangeIncreaseValue={changeIncreaseValue}
                />
              </section>

              <section className="tt-card tt-card-glass mt-4">
                <div className="tt-section-head">
                  <h2>Distribución de Necesidades</h2>
                  <p className="text-muted mb-0">Vista general del gasto solicitado.</p>
                </div>
                <ChartPlaceholder gastos={necesidades} />
              </section>
            </>
          )}

          {/* ===== Acciones inferiores ===== */}
          <section className="tt-footer-actions">
            <button
              className="tt-btn-primary"
              onClick={() => navigate('/necesidad-presupuesto', { state: { idUsuario, selectedPeriodo } })}
              disabled={!idUsuario || viewStatus.loading}
            >
              Registrar Nueva Necesidad
            </button>

            <a
              className="tt-btn-ghost"
              href="https://app.powerbi.com/links/PJl9Q2bTHd?ctid=9d12bf3f-e4f6-47ab-912f-1a2f0fc48aa4&pbi_source=linkShare"
              target="_blank"
              rel="noreferrer"
            >
              Análisis de Datos PowerBI
            </a>

            {!idUsuario && (
              <p className="form-text text-muted mt-2">
                Debe iniciar sesión para registrar necesidades.
              </p>
            )}

            {idUsuario && !selectedPeriodo && (
              <p className="form-text text-muted mt-2">
                No has seleccionado un período. Puedes crear uno al continuar.
              </p>
            )}
          </section>

        </div>
      </main>
    </>
  );
};

export default ViewDashboard;
