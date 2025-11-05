import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getData, deleteData, putData } from '../../api/api';

// CONSTANTES Y FUNCIONES DE APOYO (simuladas/ejemplo)
// Deberías tener estas definidas en tu proyecto.

// Usamos los helpers compartidos de `src/api/api.js` que ya manejan simulación

// COMPONENTES INTERNOS SIMPLES CON BOOTSTRAP

// Componente Navbar simple
const SimpleNavbar = ({ userName }) => {
return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div className="container-fluid">
        <a className="navbar-brand" href="#">PanelFinanzas</a>
        <span className="navbar-text text-white">
        {userName ? `Usuario: ${userName}` : 'Cargando usuario...'}
        </span>
    </div>
    </nav>
);
};

// Componente Tabla de Gastos/Necesidades simple (sin columna ID)
const SimpleGastosTable = ({ gastos, accionActual, onStartEliminar, onStartAumentar, onConfirmDelete, onCancelAction, onApplyIncrease, onChangeIncreaseValue }) => {
  if (!gastos || gastos.length === 0) {
    return <p className="text-center text-muted mt-3">No hay necesidades registradas para este período.</p>;
  }
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover table-bordered">
        <thead className="table-light">
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Monto Solicitado</th>
            <th>Estado</th>
            <th>Acciones</th>
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
            return (
              <tr key={gasto.id || gasto._id || idx}>
                <td>{nombre}</td>
                <td>{descripcion}</td>
                <td>${monto}</td>
                <td>{estado}</td>
                <td className="text-center">
                  {accionActual && (accionActual.id === (gasto.id || gasto._id)) ? (
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

// Componente Placeholder para el Gráfico
const ChartPlaceholder = ({ gastos }) => {
if (!gastos || gastos.length === 0) {
    return <p className="text-center text-muted">No hay datos suficientes para mostrar en el gráfico.</p>;
}
// Usar 'monto' si existe, de lo contrario 'montoSolicitado'
const totalGastado = gastos.reduce((acc, curr) => acc + (Number(curr.monto ?? curr.montoSolicitado) || 0), 0);
return (
    <div className="p-3 border rounded bg-white shadow-sm">
    <h5 className="text-center text-secondary mb-3">Visualización de Datos (Marcador)</h5>
    <p className="text-center">
        Total de Monto Solicitado en Necesidades: <strong>${totalGastado.toFixed(2)}</strong>
    </p>
    <p className="text-center fst-italic small text-muted">(Aquí se integraría un componente de gráfico)</p>
      {/* Como ejemplo, mostramos los datos en formato JSON */}
    <details>
        <summary className="text-primary" style={{cursor: 'pointer'}}>Ver datos crudos</summary>
        <pre className="bg-light p-2 rounded" style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.8em' }}>
        {JSON.stringify(gastos, null, 2)}
        </pre>
    </details>
    </div>
);
};

// COMPONENTE PRINCIPAL ViewDashboard
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

  // Estado consolidado para carga y errores
const [viewStatus, setViewStatus] = useState({ loading: true, error: null });

  // Estado para acciones en fila (eliminar / aumentar)
  const [accionActual, setAccionActual] = useState(null); // { id, mode: 'delete'|'increase', value?: number, item }

  // Efecto para establecer idUsuario de forma segura desde location.state
useEffect(() => {
    const idFromLocation = location.state?.idEstudiante ?? location.state?.userData?.data?._id;
    let idFromStorage = null;
    try { idFromStorage = localStorage.getItem('idEstudiante'); } catch {}
    const resolvedId = idFromLocation ?? idFromStorage;
    if (resolvedId) {
      setIdUsuario(resolvedId);
    } else {
      // No bloquemos con error; permitimos ver el panel básico sin datos
      setViewStatus({ loading: false, error: null });
    }
}, [location.state, navigate]);

  // Efecto para cargar datos iniciales (usuario y periodos) cuando idUsuario está disponible
useEffect(() => {
    if (!idUsuario) {
      // Si no hay idUsuario, salimos y dejamos la vista sin bloquear.
      setViewStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    setViewStatus({ loading: true, error: null }); // Inicia carga para esta cadena de datos
    let isActive = true; // Para evitar actualizaciones de estado si el componente se desmonta

    const fetchInitialData = async () => {
    try {
        // Carga de datos de usuario y periodos en paralelo
        const [dataUsuarioResponse, periodosDataResponse] = await Promise.all([
          getData(`estudiantes/${idUsuario}`),
          getData(`periodos/${idUsuario}/por-estudiante`)
        ]);

        if (!isActive) return;

        // Aseguramos un userData con nombre en modo demo
        setUserData(dataUsuarioResponse?.data ? dataUsuarioResponse : { data: { nombre: 'Estudiante Demo' } });

        // Normalizamos periodos según la forma de respuesta
        const periodosArray = Array.isArray(periodosDataResponse)
          ? periodosDataResponse
          : (Array.isArray(periodosDataResponse?.data) ? periodosDataResponse.data : []);
        setPeriodos(periodosArray);

        // Filtrar períodos que tienen presupuesto
        const periodosValidos = [];
        for (const periodo of periodosArray) {
          const periodoId = periodo._id ?? periodo.id ?? periodo.nombre ?? '';
          try {
            await getData(`necesidades/resumen-presupuesto?idEstudiante=${idUsuario}&idPeriodo=${periodoId}`);
            periodosValidos.push(periodo);
          } catch (err) {
            // Si da 404 "Presupuesto no encontrado", no incluir este período
            const msg = String(err?.message || '');
            if (!msg.includes('Presupuesto no encontrado')) {
              // Si es otro tipo de error, incluir el período de todas formas
              periodosValidos.push(periodo);
            }
          }
        }
        
        setPeriodosConPresupuesto(periodosValidos);

        if (periodosValidos.length > 0) {
          const firstPeriodoId = periodosValidos[0]?._id ?? periodosValidos[0]?.id ?? periodosValidos[0]?.nombre ?? '';
          setSelectedPeriodo(firstPeriodoId);
          
          // El estado de carga continuará hasta que los datos del período se carguen (en el siguiente efecto)
        } else {
          setNecesidades([]); // No hay periodos, no habrá necesidades
        setResumenPresupuesto(null);
          setViewStatus({ loading: false, error: null }); // Fin de la carga si no hay periodos
        }
    } catch (err) {
        if (!isActive) return;
        setViewStatus({ loading: false, error: `Error al obtener datos iniciales: ${err.message}` });
    }
    };

    fetchInitialData();
    return () => { isActive = false; }; // Cleanup
  }, [idUsuario]); // Depende de idUsuario

  // Efecto para cargar necesidades y resumen del presupuesto cuando cambia el período seleccionado o idUsuario
useEffect(() => {
    if (!selectedPeriodo || !idUsuario) {
      // Si no hay período seleccionado (y hay idUsuario, pero no periodos),
      // el efecto anterior ya debería haber puesto loading en false.
    if (idUsuario && periodos.length === 0 && !viewStatus.error) {
        setViewStatus(prev => ({ ...prev, loading: false }));
    }
    return;
    }

    setViewStatus(prev => ({ ...prev, loading: true, error: null })); // Inicia carga para datos del período
    let isActive = true;

  const fetchPeriodData = async () => {
    try {
      // Cargar necesidades
      const necesidadesDataResponse = await getData(`necesidades/por-estudiante-periodo?idEstudiante=${idUsuario}&idPeriodo=${selectedPeriodo}`);

      if (!isActive) return;

      const necesidadesArray = Array.isArray(necesidadesDataResponse)
        ? necesidadesDataResponse
        : (Array.isArray(necesidadesDataResponse?.data) ? necesidadesDataResponse.data : []);
      setNecesidades(necesidadesArray);

      // Intentar cargar resumen del presupuesto (puede no existir)
      try {
        const resumenDataResponse = await getData(`necesidades/resumen-presupuesto?idEstudiante=${idUsuario}&idPeriodo=${selectedPeriodo}`);
        setResumenPresupuesto(resumenDataResponse?.data ? resumenDataResponse : { data: resumenDataResponse });
      } catch (errResumen) {
        // Si el backend indica que no hay presupuesto, no tratamos como error de vista
        const msg = String(errResumen?.message || '');
        if (msg.includes('Presupuesto no encontrado')) {
          setResumenPresupuesto(null);
        } else {
          // Otros errores sí se reportan
          throw errResumen;
        }
      }

      setViewStatus({ loading: false, error: null });
    } catch (err) {
      if (!isActive) return;
      setViewStatus({ loading: false, error: `Error al cargar datos del período: ${err.message}` });
      setNecesidades([]);
      setResumenPresupuesto(null);
    }
  };

    fetchPeriodData();
    return () => { isActive = false; }; // Cleanup
  }, [selectedPeriodo, idUsuario, periodos]); // 'periodos' como dependencia por si su carga afecta la lógica

  // Manejador para el cambio de período
const handlePeriodoChange = (event) => {
    setSelectedPeriodo(event.target.value);
};

  // Función para recargar las necesidades del período actual (ej. después de una actualización)
const getNecesidadesCurrentPeriodo = async () => {
    if (selectedPeriodo && idUsuario) {
      // Opcional: setViewStatus(prev => ({ ...prev, loading: true })); si quieres un indicador específico
    try {
        const necesidadesData = await getData(
          `necesidades/por-estudiante-periodo?idEstudiante=${idUsuario}&idPeriodo=${selectedPeriodo}`
        );
        console.log("necesidadesData", necesidadesData)
        setNecesidades(Array.isArray(necesidadesData?.data) ? necesidadesData.data : (Array.isArray(necesidadesData) ? necesidadesData : []));
    } catch (error) {
        // Podrías manejar este error de forma más específica si es necesario
        setViewStatus(prev => ({ ...prev, error: "Error al recargar necesidades: " + error.message }));
    } finally {
        // Opcional: setViewStatus(prev => ({ ...prev, loading: false }));
    }
    }
};

// Refrescar resumen del presupuesto del período actual
const getResumenPresupuestoCurrentPeriodo = async () => {
  if (selectedPeriodo && idUsuario) {
    try {
      const resumenData = await getData(`necesidades/resumen-presupuesto?idEstudiante=${idUsuario}&idPeriodo=${selectedPeriodo}`);
      setResumenPresupuesto(resumenData?.data ? resumenData : { data: resumenData });
    } catch (error) {
      const msg = String(error?.message || '');
      if (msg.includes('Presupuesto no encontrado')) {
        // No hay presupuesto para este período; ocultar el resumen sin marcar error global
        setResumenPresupuesto(null);
      } else {
        setViewStatus(prev => ({ ...prev, error: "Error al recargar resumen: " + error.message }));
      }
    }
  }
};

  // Eliminar necesidad desde el Dashboard
  const startEliminar = (necesidad) => {
    const id = necesidad.id || necesidad._id;
    if (!id) return;
    setAccionActual({ id, mode: 'delete', item: necesidad });
  };

  const confirmarEliminar = async () => {
    if (!accionActual?.id) return;
    try {
      await deleteData(`necesidades/${accionActual.id}`);
      // Refrescar datos y resumen del período
      await getNecesidadesCurrentPeriodo();
      await getResumenPresupuestoCurrentPeriodo();
    } catch (e) {
      alert('Error al eliminar necesidad: ' + (e?.message || ''));
    } finally {
      setAccionActual(null);
    }
  };

  // Aumentar monto de necesidad
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
      // Asegurar referencias consistentes (idEstudiante, idPeriodo, idPresupuesto)
      let idEst = necesidad.idEstudiante || idUsuario || null;
      let idPer = necesidad.idPeriodo || selectedPeriodo || null;
      let idPres = necesidad.idPresupuesto || null;

      if (!idPres && idEst && idPer) {
        // Obtener el presupuesto del período actual si falta la referencia
        const presupuestoResp = await getData(`presupuestos/por-estudiante-periodo?idEstudiante=${idEst}&idPeriodo=${idPer}`);
        const p = presupuestoResp?.data || presupuestoResp;
        idPres = p?.id || p?._id || null;
      }

      const dto = {
        id: id,
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

// Función para editar el presupuesto desde el resumen
const aumentarPresupuesto = async () => {
  try {
    if (!idUsuario || !selectedPeriodo) {
      alert('Seleccione un período para editar el presupuesto.');
      return;
    }
    const presupuestoResp = await getData(`presupuestos/por-estudiante-periodo?idEstudiante=${idUsuario}&idPeriodo=${selectedPeriodo}`);
    const p = presupuestoResp?.data || presupuestoResp;
    const presupuestoId = p?.id || p?._id;
    if (!presupuestoId) {
      alert('No se encontró el presupuesto del período seleccionado.');
      return;
    }
    navigate(`/presupuesto/${presupuestoId}/editar`);
  } catch (e) {
    setViewStatus(prev => ({ ...prev, error: 'Error al abrir edición de presupuesto: ' + e.message }));
    alert('No fue posible abrir la edición de presupuesto.');
  }
};

  // Renderizado condicional para estados de carga y error
if (viewStatus.loading) {
    return (
    <>
        <SimpleNavbar userName={userData?.nombre} />
        <div className="d-flex justify-content-center align-items-center" style={{ height: 'calc(100vh - 56px)' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando datos...</span>
        </div>
        <span className="ms-3 fs-5">Cargando datos, por favor espere...</span>
        </div>
    </>
    );
}

if (viewStatus.error) {
    return (
    <>
        <SimpleNavbar userName={userData?.nombre} />
        <div className="container mt-4">
        <div className="alert alert-danger text-center" role="alert">
            <h4 className="alert-heading">¡Ocurrió un Error!</h4>
            <p>{viewStatus.error}</p>
            {idUsuario === null && <p>Si el problema persiste, intente <a href="/login" className="alert-link">iniciar sesión</a> nuevamente.</p>}
            <button className="btn btn-danger mt-2" onClick={() => window.location.reload()}>Intentar de Nuevo</button>
        </div>
        </div>
    </>
    );
}

  // Calculamos el porcentaje consumido para la barra de progreso y el badge
  // Asumimos que resumenPresupuesto.porcentajeConsumido viene de la API, si no, calcularlo:
  // const porcentajeConsumido = (resumenPresupuesto && resumenPresupuesto.totalAsignado > 0)
  // ? (resumenPresupuesto.totalGastado / resumenPresupuesto.totalAsignado) * 100
  // : 0;
  // Por ahora, usaremos el valor que viene en el objeto resumenPresupuesto si existe.
const porcentajeConsumido = resumenPresupuesto?.data?.porcentajeConsumido ?? 0;


return (
    <>
    <SimpleNavbar userName={userData?.data?.nombre} />
    <div className="container mt-4 mb-5">
        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/home', { state: { idEstudiante: idUsuario } })}
          >
            Ir al Home
          </button>
        </div>
        <header className="text-center mb-4">
        <h1 className="display-5 text-primary">Panel de Control Financiero</h1>
        {userData && <p className="lead text-muted">Bienvenido/a, {userData.data?.nombre} {userData.data?.apellido || ''}</p>}
        </header>

        {/* Selector de Periodo */}
        <section className="mb-4 p-3 border rounded bg-light shadow-sm">
        <h2 className='mb-3 h5 text-primary'>Seleccionar Período Académico</h2>
        {periodosConPresupuesto.length > 0 ? (
            <select
            className="form-select form-select-lg"
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
            <div className="text-center">
              <p className="text-muted mb-3">No hay períodos con presupuesto disponibles.</p>
              <button
                className="btn btn-success"
                onClick={() => navigate('/necesidad-presupuesto', { state: { idUsuario: idUsuario } })}
              >
                Crear Primer Presupuesto
              </button>
            </div>
        )}
        </section>

        {/* Resumen del Presupuesto (si hay período seleccionado y datos) */}
        {selectedPeriodo && resumenPresupuesto && (
        <section className="card mb-4 shadow-lg">
            <div className="card-header bg-info text-white">
            <h2 className="card-title h5 mb-0">Resumen del Presupuesto ({resumenPresupuesto?.data?.descripcionPresupuesto || 'General'})</h2>
            </div>
            <div className="card-body">
            <div className="row mb-3">
                <div className="col-md-4">
                <p className="mb-1"><strong>Total Asignado:</strong></p>
                <p className="fs-4 text-success">${(resumenPresupuesto?.data?.totalAsignado || 0).toFixed(2)}</p>
                </div>
                <div className="col-md-4">
                <p className="mb-1"><strong>Total Gastado:</strong></p>
                <p className="fs-4 text-danger">${(resumenPresupuesto?.data?.totalGastado || 0).toFixed(2)}</p>
                </div>
                <div className="col-md-4">
                <p className="mb-1"><strong>Disponible:</strong></p>
                <p className={`fs-4 ${resumenPresupuesto?.data?.disponible < 0 ? 'text-danger fw-bold' : 'text-primary'}`}>
                    ${(resumenPresupuesto?.data?.disponible || 0).toFixed(2)}
                </p>
                </div>
            </div>
            
            <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                <span>Porcentaje Consumido:</span>
                <span className={`badge fs-6 ${porcentajeConsumido > 100 ? "bg-danger" : (porcentajeConsumido > 80 ? "bg-warning text-dark" : "bg-success")}`}>
                    {porcentajeConsumido.toFixed(2)}%
                </span>
                </div>
                <div className="progress" style={{ height: '25px' }}>
                <div
                    className={`progress-bar progress-bar-striped progress-bar-animated ${porcentajeConsumido > 100 ? "bg-danger" : (porcentajeConsumido > 80 ? "bg-warning text-dark" : "bg-success")}`}
                    role="progressbar"
                    style={{ width: `${Math.min(porcentajeConsumido, 100)}%` }} // Cap at 100% for visual
                    aria-valuenow={porcentajeConsumido}
                    aria-valuemin="0"
                    aria-valuemax="100"
                >
                    {porcentajeConsumido.toFixed(0)}%
            </div>
                </div>
                {porcentajeConsumido > 100 &&
                <p className="text-danger small mt-1 fw-bold">¡Atención! Has excedido el presupuesto asignado.</p>
                }
            </div>
            <button onClick={aumentarPresupuesto} className="btn btn-outline-primary mt-2">
                <i className="bi bi-plus-circle me-2"></i>Ajustar Monto del Presupuesto
            </button>
            </div>
        </section>
        )}
        {selectedPeriodo && !resumenPresupuesto && (
        <section className="card mb-4 shadow-sm">
          <div className="card-body">
            <p className="mb-2 text-muted">No hay presupuesto asociado para este período.</p>
            <div className="d-flex gap-2">
              <button onClick={aumentarPresupuesto} className="btn btn-outline-primary">
                Buscar/Editar Presupuesto del Período
              </button>
              <button
                className="btn btn-success"
                onClick={() => navigate('/necesidad-presupuesto', { state: { idUsuario: idUsuario, selectedPeriodo: selectedPeriodo } })}
              >
                Crear Presupuesto
              </button>
            </div>
          </div>
        </section>
        )}
        {!selectedPeriodo && idUsuario && <p className="text-center text-info mt-3">Por favor, seleccione un período para ver el resumen del presupuesto y las necesidades asociadas.</p>}

        {/* Tabla de Necesidades y Gráfico (si hay período seleccionado) */}
        {selectedPeriodo && (
        <>
            <section className="mb-5">
            <h2 className="text-center text-primary my-4">Mis Necesidades Registradas</h2>
            <div className="shadow-sm border rounded p-3 bg-white">
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
            </div>
            </section>

            <section className="my-5">
            <h2 className="text-center text-primary mb-4">Distribución de Necesidades (Visualización)</h2>
            <div className="p-lg-4 p-2 border rounded bg-light shadow-sm">
                <ChartPlaceholder gastos={necesidades} />
            </div>
            </section>
        </>
        )}

        {/* Botón para Crear Nueva Necesidad */}
        <div className="text-center mt-4 pt-3 border-top">
        <button
            className="btn btn-success btn-lg shadow"
            onClick={() => navigate('/necesidad-presupuesto', { state: { idUsuario: idUsuario, selectedPeriodo: selectedPeriodo } })}
            disabled={!idUsuario || viewStatus.loading}
        >
            <i className="bi bi-plus-lg me-2"></i>Registrar Nueva Necesidad
        </button>
        <a
            className="btn btn-primay btn-lg shadow mt-2"
            href = "https://app.powerbi.com/links/PJl9Q2bTHd?ctid=9d12bf3f-e4f6-47ab-912f-1a2f0fc48aa4&pbi_source=linkShare"
        >
            <i className="bi bi-plus-lg me-2"></i>Analisis De Datos PowerBi
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
        </div>
    </div>
    </>
    );
};

export default ViewDashboard;
