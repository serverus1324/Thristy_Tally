import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// CONSTANTES Y FUNCIONES DE APOYO (simuladas/ejemplo)
// Deberías tener estas definidas en tu proyecto.

// URL base de tu API (reemplaza con la real)
const API_BASE_URL = 'http://localhost:8081';
// Función simulada para obtener datos (reemplaza con tu implementación real)
async function getData(endpoint) {
try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en la petición API (${response.status}): ${errorText || response.statusText}`);
    }
    // Manejar respuestas vacías que no son JSON válido
    const textData = await response.text();
    if (!textData) {
      return null; // O [], {} según lo que espere el endpoint
    }
    return JSON.parse(textData);
} catch (err) {
    console.error(`Error en getData para el endpoint ${endpoint}:`, err);
    throw err; // Re-lanza para que el llamador lo maneje
}
}

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

// Componente Tabla de Gastos/Necesidades simple
const SimpleGastosTable = ({ gastos }) => {
if (!gastos || gastos.length === 0) {
    return <p className="text-center text-muted mt-3">No hay necesidades registradas para este período.</p>;
}
return (
    <div className="table-responsive">
<table className="table table-striped table-hover table-bordered">
        <thead className="table-light">
        <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Monto Solicitado</th>
            <th>Estado</th>
            <th>Prioridad</th>
            {/* Puedes añadir más columnas según la estructura de tus datos de 'necesidades' */}
        </tr>
        </thead>
        <tbody>
        {gastos.map((gasto) => (
            <tr key={gasto.id || gasto.nombre}> {/* Asegura una key única */}
            <td>{gasto.id || 'N/A'}</td>
            <td>{gasto.nombre || 'N/A'}</td>
            <td>{gasto.descripcion || 'N/A'}</td>
            <td>${gasto.monto? gasto.monto.toFixed(2) : '0.00'}</td>
            <td>{gasto.estado || 'N/A'}</td>
            <td>{gasto.prioridad || 'N/A'}</td>
            </tr>
        ))}
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
const totalGastado = gastos.reduce((acc, curr) => acc + (Number(curr.montoSolicitado) || 0), 0);
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
const [selectedPeriodo, setSelectedPeriodo] = useState('');
const [resumenPresupuesto, setResumenPresupuesto] = useState(null);

  // Estado consolidado para carga y errores
const [viewStatus, setViewStatus] = useState({ loading: true, error: null });

  // Efecto para establecer idUsuario de forma segura desde location.state
useEffect(() => {
    const userIdFromLocation = location.state?.userData?.data?._id;
    if (userIdFromLocation) {
    setIdUsuario(userIdFromLocation);
    } else {l
    setViewStatus({ loading: false, error: "No se pudo obtener la información del usuario. Por favor, vuelva a iniciar sesión." });
      // Opcionalmente, redirigir: navigate('/login');
    }
}, [location.state, navigate]);

  // Efecto para cargar datos iniciales (usuario y periodos) cuando idUsuario está disponible
useEffect(() => {
    if (!idUsuario) {
      // Si idUsuario nunca se va a establecer (ya manejado por el efecto anterior),
      // asegurar que loading sea false.
    if (!location.state?.userData?.data?._id) {
        setViewStatus(prev => ({ ...prev, loading: false, error: prev.error || "ID de usuario no proporcionado."}));
    }
    return;
    }

    setViewStatus({ loading: true, error: null }); // Inicia carga para esta cadena de datos
    let isActive = true; // Para evitar actualizaciones de estado si el componente se desmonta

    const fetchInitialData = async () => {
    try {
        // Carga de datos de usuario y periodos en paralelo
        const [dataUsuarioResponse, periodosDataResponse] = await Promise.all([
        getData(`api/v1/estudiantes/${idUsuario}`),
          getData(`api/v1/periodos`) // Asume que este endpoint devuelve un array de periodos
        ]);

        if (!isActive) return;

        setUserData(dataUsuarioResponse);
        // const validPeriodos = Array.isArray(periodosDataResponse) ? periodosDataResponse : [];
        const periodosEst = periodosDataResponse.data.filter(p => p.idEstudiante == idUsuario);
        setPeriodos(periodosEst);

        if (periodosEst.length > 0) {
        setSelectedPeriodo(periodosEst[0]._id);
        
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
        const [necesidadesDataResponse, resumenDataResponse] = await Promise.all([
        getData(`api/v1/necesidades/por-estudiante-periodo?idEstudiante=${idUsuario}&idPeriodo=${selectedPeriodo}`),
        getData(`api/v1/necesidades/resumen-presupuesto?idEstudiante=${idUsuario}&idPeriodo=${selectedPeriodo}`)
        ]);

        if (!isActive) return;

        setNecesidades(Array.isArray(necesidadesDataResponse.data) ? necesidadesDataResponse.data : []);
        setResumenPresupuesto(resumenDataResponse);
        setViewStatus({ loading: false, error: null }); // Fin de la carga
    } catch (err) {
        if (!isActive) return;
        setViewStatus({ loading: false, error: `Error al cargar datos del período: ${err.message}` });
        setNecesidades([]); // Limpiar datos en caso de error
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
        `api/v1/necesidades/por-estudiante-periodo?idEstudiante=${idUsuario}&idPeriodo=${selectedPeriodo}`
        );
        console.log("necesidadesData", necesidadesData)
        setNecesidades(Array.isArray(necesidadesData) ? necesidadesData : []);
    } catch (error) {
        // Podrías manejar este error de forma más específica si es necesario
        setViewStatus(prev => ({ ...prev, error: "Error al recargar necesidades: " + error.message }));
    } finally {
        // Opcional: setViewStatus(prev => ({ ...prev, loading: false }));
    }
    }
};

  // Función para aumentar el presupuesto
const aumentarPresupuesto = async () => {
    if (!resumenPresupuesto || !resumenPresupuesto.data.idPresupuesto) {
    alert('No se puede aumentar el presupuesto. No hay un presupuesto asignado o falta su ID.');
    return;
    }

    const nuevoMontoStr = prompt('Ingrese el nuevo monto total del presupuesto:');
    if (nuevoMontoStr === null || nuevoMontoStr.trim() === "") {
      return; // Usuario canceló o no ingresó nada
    }

    const montoDouble = parseFloat(nuevoMontoStr);
    if (isNaN(montoDouble) || montoDouble <= 0) {
    alert('Monto no válido. Por favor, ingrese un número positivo.');
    return;
    }

    try {
    const response = await fetch(`${API_BASE_URL}/api/v1/presupuestos/${resumenPresupuesto.data.idPresupuesto}/monto?nuevoMonto=${montoDouble}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }, // Buena práctica
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al aumentar el presupuesto (${response.status}): ${errorText}`);
    }

    alert('Presupuesto aumentado exitosamente');

      // Recargar resumen del presupuesto y necesidades
      setViewStatus(prev => ({ ...prev, loading: true})); // Indicar carga
    const resumenActualizado = await getData(
        `api/v1/necesidades/resumen-presupuesto?idEstudiante=${idUsuario}&idPeriodo=${selectedPeriodo}`
    );
    setResumenPresupuesto(resumenActualizado);
      await getNecesidadesCurrentPeriodo(); // Recargar tabla de necesidades
    setViewStatus(prev => ({ ...prev, loading: false}));

    } catch (error) {
    setViewStatus(prev => ({ ...prev, loading: false, error: 'Error al aumentar el presupuesto: ' + error.message }));
    alert('Error al aumentar el presupuesto: ' + error.message);
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
        <header className="text-center mb-4">
        <h1 className="display-5 text-primary">Panel de Control Financiero</h1>
        {userData && <p className="lead text-muted">Bienvenido/a, {userData.data?.nombre} {userData.data?.apellido || ''}</p>}
        </header>

        {/* Selector de Periodo */}
        <section className="mb-4 p-3 border rounded bg-light shadow-sm">
        <h2 className='mb-3 h5 text-primary'>Seleccionar Período Académico</h2>
        {periodos.length > 0 ? (
            <select
            className="form-select form-select-lg"
            value={selectedPeriodo}
            onChange={handlePeriodoChange}
            aria-label="Selector de período"
            >
            <option value="" disabled>-- Seleccione un período --</option>
            {periodos.map((periodo) => (
                <option key={periodo._id} value={periodo._id}>
                  {periodo._id} {/* LUEGO CAMBIAR POR NOMBRE CUANDO TENGA */}
                </option>
            ))}
            </select>
        ) : (
            <p className="text-muted">No hay períodos disponibles para seleccionar.</p>
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
        {!selectedPeriodo && idUsuario && <p className="text-center text-info mt-3">Por favor, seleccione un período para ver el resumen del presupuesto y las necesidades asociadas.</p>}

        {/* Tabla de Necesidades y Gráfico (si hay período seleccionado) */}
        {selectedPeriodo && (
        <>
            <section className="mb-5">
            <h2 className="text-center text-primary my-4">Mis Necesidades Registradas</h2>
            <div className="shadow-sm border rounded p-3 bg-white">
                <SimpleGastosTable gastos={necesidades} />
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
            disabled={!idUsuario || !selectedPeriodo || viewStatus.loading}
        >
            <i className="bi bi-plus-lg me-2"></i>Registrar Nueva Necesidad
        </button>
        <a
            className="btn btn-primay btn-lg shadow mt-2"
            href = "https://app.powerbi.com/links/PJl9Q2bTHd?ctid=9d12bf3f-e4f6-47ab-912f-1a2f0fc48aa4&pbi_source=linkShare"
        >
            <i className="bi bi-plus-lg me-2"></i>Analisis De Datos PowerBi
        </a>
        {(!idUsuario || !selectedPeriodo) &&
            <p className="form-text text-muted mt-2">
                { !idUsuario ? "Debe iniciar sesión para registrar necesidades." : "Debe seleccionar un período para registrar una necesidad."}
            </p>
        }
        </div>
    </div>
    </>
    );
};

export default ViewDashboard;
