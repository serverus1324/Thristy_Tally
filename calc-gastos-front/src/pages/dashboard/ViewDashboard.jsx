import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getData, deleteData, putData } from '../../api/api';
import Navbar from '../../components/navbar/Navbar';
import { Toaster, toast } from 'react-hot-toast';
import Chart from '../../components/chart/Chart';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import "./dashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const SimpleGastosTable = ({
  gastos,
  accionActual,
  onStartEliminar,
  onStartAumentar,
  onStartEditar,
  onConfirmDelete,
  onCancelAction,
  onApplyIncrease,
  onChangeIncreaseValue,
  onApplyEdit,
  onChangeEditValue,
  searchTerm
}) => {
  const filteredGastos = gastos.filter(gasto => {
    const nombre = (gasto?.nombre || gasto?.descripcion || '').toLowerCase();
    const descripcion = (gasto?.descripcion || gasto?.nombre || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return nombre.includes(search) || descripcion.includes(search);
  });

  if (!filteredGastos || filteredGastos.length === 0) {
    return (
      <div className="tt-empty-state">
        <div className="tt-empty-icon">📭</div>
        <h3>No hay necesidades encontradas</h3>
        <p>
          {searchTerm 
            ? "Intente con otra búsqueda o registre una nueva necesidad."
            : "¡Comience registrando su primera necesidad!"}
        </p>
      </div>
    );
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
          {filteredGastos.map((gasto, idx) => {
            const nombre = gasto?.nombre || gasto?.descripcion || '—';
            const descripcion = gasto?.descripcion || gasto?.nombre || '—';
            const montoBase = gasto?.monto ?? gasto?.montoSolicitado;
            const monto = montoBase != null ? Number(montoBase).toFixed(2) : '0.00';
            const estado = typeof gasto?.esPredeterminada === 'number'
              ? (gasto.esPredeterminada === 1 ? 'Predeterminada' : 'Establecida')
              : (gasto?.estado || '—');

            const gid = gasto.id || gasto._id || idx;
            const isEditing = accionActual && accionActual.id === gid && accionActual.mode === 'edit';
            const isDeleting = accionActual && accionActual.id === gid && accionActual.mode === 'delete';
            const isIncreasing = accionActual && accionActual.id === gid && accionActual.mode === 'increase';

            return (
              <tr key={gid}>
                {isEditing ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={accionActual.editNombre || nombre}
                        onChange={(e) => onChangeEditValue('editNombre', e.target.value)}
                        className="form-control"
                        placeholder="Nombre"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={accionActual.editDescripcion || descripcion}
                        onChange={(e) => onChangeEditValue('editDescripcion', e.target.value)}
                        className="form-control"
                        placeholder="Descripción"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={accionActual.editMonto || monto}
                        onChange={(e) => onChangeEditValue('editMonto', e.target.value)}
                        className="form-control"
                        min="0"
                        step="0.01"
                        placeholder="Monto"
                      />
                    </td>
                    <td>{estado}</td>
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <button className="btn btn-sm btn-success" onClick={onApplyEdit}>
                          Guardar
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={onCancelAction}>
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{nombre}</td>
                    <td className="text-muted">{descripcion}</td>
                    <td className="fw-semibold">${monto}</td>
                    <td>{estado}</td>
                    <td className="text-center">
                      {isDeleting ? (
                        <div className="d-flex gap-2 justify-content-center">
                          <button className="btn btn-sm btn-danger" onClick={onConfirmDelete}>
                            Confirmar
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={onCancelAction}>
                            Cancelar
                          </button>
                        </div>
                      ) : isIncreasing ? (
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
                          <button className="btn btn-sm btn-warning" onClick={onApplyIncrease}>
                            Aplicar
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={onCancelAction}>
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm btn-info"
                            onClick={() => onStartEditar(gasto)}
                            title="Editar"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => onStartAumentar(gasto)}
                            title="Aumentar valor"
                          >
                            ➕ Aumentar
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => onStartEliminar(gasto)}
                            title="Eliminar"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </>
                )}
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
    return (
      <div className="tt-empty-state">
        <div className="tt-empty-icon">📊</div>
        <h3>No hay datos suficientes</h3>
        <p>Registre algunas necesidades para ver el gráfico.</p>
      </div>
    );
  }

  const totalGastado = gastos.reduce(
    (acc, curr) => acc + (Number(curr.monto ?? curr.montoSolicitado) || 0),
    0
  );

  const aggByTipo = gastos.reduce((acc, g) => {
    const tipo = String(g.tipo || g.descripcion || 'OTROS').toUpperCase();
    const monto = Number(g.monto || g.montoSolicitado || 0);
    acc[tipo] = (acc[tipo] || 0) + (isNaN(monto) ? 0 : monto);
    return acc;
  }, {});

  const labels = Object.keys(aggByTipo);
  const values = labels.map(l => aggByTipo[l]);
  
  const colors = [
    'rgba(56, 189, 248, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(96, 165, 250, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(125, 211, 252, 0.8)',
    'rgba(167, 243, 208, 0.8)'
  ];

  const borderColors = colors.map(c => c.replace('0.8', '1'));

  const pieData = {
    labels,
    datasets: [
      {
        label: 'Monto por categoría',
        data: values,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: borderColors.slice(0, labels.length),
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0',
          font: { weight: 'bold' }
        }
      },
      title: {
        display: true,
        text: 'Distribución de Gastos por Categoría',
        color: '#f0f9ff',
        font: { weight: 'bold', size: 16 }
      },
    },
  };

  return (
    <div className="tt-chart-card">
      <div className="tt-chart-header">
        <h5>Visualización de Datos</h5>
        <p className="text-muted mb-0">Total solicitado: ${totalGastado.toFixed(2)}</p>
      </div>
      <div style={{ height: '400px' }}>
        <Pie data={pieData} options={pieOptions} />
      </div>
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
  const [searchTerm, setSearchTerm] = useState('');

  const [viewStatus, setViewStatus] = useState({ loading: true, error: null });
  const [accionActual, setAccionActual] = useState(null);

  /* ===== acciones Navbar ===== */
  const handleGoHome = () => {
    if (!idUsuario) return;
    navigate("/home", { state: { idPerfil: idUsuario } });
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
    } catch {}
    navigate("/login");
  };

  const handleEditProfile = () => {
    if (!idUsuario) return;
    navigate("/editar-datos", { state: { idPerfil: idUsuario } });

  };

  /* 1) Resolver idUsuario */
  useEffect(() => {
    const idFromLocation = location.state?.idPerfil ?? location.state?.userData?.data?._id;
    let idFromStorage = null;
    try { idFromStorage = localStorage.getItem('idPerfil'); } catch {}
    const resolvedId = idFromLocation ?? idFromStorage;

    if (/^[a-f\d]{24}$/i.test(String(resolvedId ?? ""))) {
      setIdUsuario(resolvedId);
    } else {
      setViewStatus({
        loading: false,
        error: "Esta cuenta no tiene un perfil válido asociado. Inicia sesión con una cuenta registrada."
      });
    }
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
          getData(`periodos/${idUsuario}/por-perfil`)
        ]);

        if (!isActive) return;

        setUserData(dataUsuarioResponse);

        const periodosArray = Array.isArray(periodosDataResponse)
          ? periodosDataResponse
          : (Array.isArray(periodosDataResponse?.data) ? periodosDataResponse.data : []);
        setPeriodos(periodosArray);

        const periodosValidos = [];
        for (const periodo of periodosArray) {
          const periodoId = periodo._id ?? periodo.id ?? periodo.nombre ?? '';
          try {
            await getData(
              `necesidades/resumen-presupuesto?idPerfil=${idUsuario}&idPeriodo=${periodoId}`
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
          `necesidades/por-perfil-periodo?idPerfil=${idUsuario}&idPeriodo=${selectedPeriodo}`
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
            `necesidades/resumen-presupuesto?idPerfil=${idUsuario}&idPeriodo=${selectedPeriodo}`
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
          `necesidades/por-perfil-periodo?idPerfil=${idUsuario}&idPeriodo=${selectedPeriodo}`
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
          `necesidades/resumen-presupuesto?idPerfil=${idUsuario}&idPeriodo=${selectedPeriodo}`
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
      toast.success('Necesidad eliminada con éxito!');
    } catch (e) {
      toast.error('Error al eliminar necesidad: ' + (e?.message || ''));
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
      toast.error('Valor inválido. Ingrese un número mayor a 0.');
      return;
    }

    const necesidad = accionActual.item;
    const id = necesidad.id || necesidad._id;
    const montoActual = Number((necesidad.monto ?? necesidad.montoSolicitado) || 0);
    const nuevoMonto = montoActual + incremento;

    try {
      let idEst = necesidad.idPerfil || idUsuario || null;
      let idPer = necesidad.idPeriodo || selectedPeriodo || null;
      let idPres = necesidad.idPresupuesto || null;

      if (!idPres && idEst && idPer) {
        const presupuestoResp = await getData(
          `presupuestos/por-perfil-periodo?idPerfil=${idEst}&idPeriodo=${idPer}`
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
        idPerfil: idEst,
        idPeriodo: idPer,
        idPresupuesto: idPres
      };

      await putData('necesidades', dto);
      await getNecesidadesCurrentPeriodo();
      await getResumenPresupuestoCurrentPeriodo();
      toast.success('Monto actualizado con éxito!');
    } catch (e) {
      toast.error('Error al actualizar el monto: ' + (e?.message || ''));
      console.error('PUT necesidades error', e);
    } finally {
      setAccionActual(null);
    }
  };

  const startEditar = (necesidad) => {
    const id = necesidad.id || necesidad._id;
    if (!id) return;
    setAccionActual({
      id,
      mode: 'edit',
      item: necesidad,
      editNombre: necesidad?.nombre || necesidad?.descripcion || '',
      editDescripcion: necesidad?.descripcion || necesidad?.nombre || '',
      editMonto: necesidad?.monto ?? necesidad?.montoSolicitado ?? ''
    });
  };

  const onChangeEditValue = (field, value) => {
    setAccionActual(prev => ({ ...prev, [field]: value }));
  };

  const applyEdit = async () => {
    if (!accionActual?.id) return;

    const necesidad = accionActual.item;
    const id = necesidad.id || necesidad._id;
    
    const nuevoMonto = Number(accionActual.editMonto);
    if (Number.isNaN(nuevoMonto) || nuevoMonto < 0) {
      toast.error('Monto inválido. Ingrese un número mayor o igual a 0.');
      return;
    }

    try {
      let idEst = necesidad.idPerfil || idUsuario || null;
      let idPer = necesidad.idPeriodo || selectedPeriodo || null;
      let idPres = necesidad.idPresupuesto || null;

      if (!idPres && idEst && idPer) {
        const presupuestoResp = await getData(
          `presupuestos/por-perfil-periodo?idPerfil=${idEst}&idPeriodo=${idPer}`
        );
        const p = presupuestoResp?.data || presupuestoResp;
        idPres = p?.id || p?._id || null;
      }

      const dto = {
        id,
        nombre: accionActual.editNombre,
        descripcion: accionActual.editDescripcion,
        monto: nuevoMonto,
        esPredeterminada: typeof necesidad.esPredeterminada === 'number'
          ? necesidad.esPredeterminada
          : (necesidad.esPredeterminada ? 1 : 0),
        idPerfil: idEst,
        idPeriodo: idPer,
        idPresupuesto: idPres
      };

      await putData('necesidades', dto);
      await getNecesidadesCurrentPeriodo();
      await getResumenPresupuestoCurrentPeriodo();
      toast.success('Necesidad actualizada con éxito!');
    } catch (e) {
      toast.error('Error al actualizar la necesidad: ' + (e?.message || ''));
      console.error('PUT necesidades error', e);
    } finally {
      setAccionActual(null);
    }
  };

  const cancelAction = () => setAccionActual(null);

  const aumentarPresupuesto = async () => {
    try {
      if (!idUsuario || !selectedPeriodo) {
        toast.error('Seleccione un período para editar el presupuesto.');
        return;
      }
      const presupuestoResp = await getData(
        `presupuestos/por-perfil-periodo?idPerfil=${idUsuario}&idPeriodo=${selectedPeriodo}`
      );
      const p = presupuestoResp?.data || presupuestoResp;
      const presupuestoId = p?.id || p?._id;

      if (!presupuestoId) {
        toast.error('No se encontró el presupuesto del período seleccionado.');
        return;
      }
      navigate(`/presupuesto/${presupuestoId}/editar`);
    } catch (e) {
      setViewStatus(prev => ({
        ...prev,
        error: 'Error al abrir edición de presupuesto: ' + e.message
      }));
      toast.error('No fue posible abrir la edición de presupuesto.');
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
        <Toaster 
          position="top-right"
          toastOptions={{
            style: { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(56,189,248,0.3)' },
            success: { style: { background: '#064e3b', color: '#bbf7d0', border: '1px solid rgba(34,197,94,0.5)' } },
            error: { style: { background: '#7f1d1d', color: '#fecaca', border: '1px solid rgba(239,68,68,0.5)' } }
          }}
        />
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
          <div className="tt-dashboard-stage">
            <div className="tt-central-card">
              <div className="alert alert-danger text-center">
                <h4 className="alert-heading">¡Ocurrió un Error!</h4>
                <p>{viewStatus.error}</p>
                {idUsuario === null && (
                  <p className="mb-0">
                    Si el problema persiste, intenta{' '}
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
          </div>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(56,189,248,0.3)' },
            success: { style: { background: '#064e3b', color: '#bbf7d0', border: '1px solid rgba(34,197,94,0.5)' } },
            error: { style: { background: '#7f1d1d', color: '#fecaca', border: '1px solid rgba(239,68,68,0.5)' } }
          }}
        />
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
          <div className="tt-central-card">
            {/* ===== Header ===== */}
            <div className="tt-card-header">
              <div className="tt-chip">PANEL DE CONTROL</div>
              <h2 className="tt-card-title">Gestión de Presupuestos</h2>
            </div>

            {/* ===== Selector de Período ===== */}
            <div className="tt-period-section">
              <label className="tt-label">Seleccionar Período Académico</label>
              {periodosConPresupuesto.length > 0 ? (
                <select
                  className="tt-select"
                  value={selectedPeriodo}
                  onChange={handlePeriodoChange}
                  aria-label="Selector de período"
                >
                  <option value="" disabled>-- Selecciona un período --</option>
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
                <div className="tt-empty-period">
                  <p>No hay períodos con presupuesto disponibles.</p>
                  <button
                    className="tt-btn-primary-gradient"
                    onClick={() => navigate('/necesidad-presupuesto', { state: { idUsuario } })}
                  >
                    Crear Primer Presupuesto
                  </button>
                </div>
              )}
            </div>

            {/* ===== Resumen ===== */}
            {selectedPeriodo && resumenPresupuesto && (
              <div className="tt-resumen-section">
                <div className="tt-resumen-header">
                  <h3>Resumen del Presupuesto: {resumenPresupuesto?.data?.descripcionPresupuesto || 'General'}</h3>
                  <button onClick={aumentarPresupuesto} className="tt-btn-soft">
                    Ajustar Presupuesto
                  </button>
                </div>
                <div className="tt-resumen-grid">
                  <div className="tt-resumen-item">
                    <div className="tt-resumen-icon blue"></div>
                    <div className="tt-resumen-info">
                      <span>Total Asignado</span>
                      <strong>${(resumenPresupuesto?.data?.totalAsignado || 0).toFixed(2)}</strong>
                    </div>
                  </div>
                  <div className="tt-resumen-item">
                    <div className="tt-resumen-icon red"></div>
                    <div className="tt-resumen-info">
                      <span>Total Gastado</span>
                      <strong>${(resumenPresupuesto?.data?.totalGastado || 0).toFixed(2)}</strong>
                    </div>
                  </div>
                  <div className="tt-resumen-item">
                    <div className="tt-resumen-icon green"></div>
                    <div className="tt-resumen-info">
                      <span>Disponible</span>
                      <strong className={`${resumenPresupuesto?.data?.disponible < 0 ? 'neg' : ''}`}>
                        ${(resumenPresupuesto?.data?.disponible || 0).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="tt-progress-section">
                  <div className="tt-progress-header">
                    <span>Porcentaje Consumido</span>
                    <span className={`tt-progress-badge ${porcentajeConsumido > 100 ? 'danger' : porcentajeConsumido > 80 ? 'warn' : 'ok'}`}>
                      {porcentajeConsumido.toFixed(2)}%
                    </span>
                  </div>
                  <div className="tt-progress">
                    <div
                      className={`tt-progress-fill ${porcentajeConsumido > 100 ? 'danger' : porcentajeConsumido > 80 ? 'warn' : 'ok'}`}
                      style={{ width: `${Math.min(porcentajeConsumido, 100)}%` }}
                    ></div>
                  </div>
                  {porcentajeConsumido > 100 && (
                    <p className="tt-warning-text">
                      ¡Atención! Has excedido el presupuesto asignado.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ===== Necesidades y Gráfico ===== */}
            {selectedPeriodo && (
              <div className="tt-content-sections">
                <div className="tt-section">
                  <div className="tt-section-header">
                    <h3>Mis Necesidades Registradas</h3>
                    <div className="tt-search-wrap">
                      <input
                        type="text"
                        placeholder="Buscar necesidad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="tt-input-search"
                      />
                    </div>
                  </div>
                  <SimpleGastosTable
                    gastos={necesidades}
                    accionActual={accionActual}
                    onStartEliminar={startEliminar}
                    onStartAumentar={startAumentar}
                    onStartEditar={startEditar}
                    onConfirmDelete={confirmarEliminar}
                    onCancelAction={cancelAction}
                    onApplyIncrease={applyIncrease}
                    onChangeIncreaseValue={changeIncreaseValue}
                    onApplyEdit={applyEdit}
                    onChangeEditValue={onChangeEditValue}
                    searchTerm={searchTerm}
                  />
                </div>

                <div className="tt-section">
                  <div className="tt-section-header">
                    <h3>Distribución de Gastos</h3>
                  </div>
                  <ChartPlaceholder gastos={necesidades} />
                </div>
              </div>
            )}

            {/* ===== Footer Actions ===== */}
            <div className="tt-footer-actions">
              <button
                className="tt-btn-primary-gradient"
                onClick={() => navigate('/necesidad-presupuesto', { state: { idUsuario, selectedPeriodo } })}
                disabled={!idUsuario || viewStatus.loading}
              >
                📝 Registrar Nueva Necesidad
              </button>

              <a
                className="tt-btn-secondary"
                href="https://app.powerbi.com/links/PJl9Q2bTHd?ctid=9d12bf3f-e4f6-47ab-912f-1a2f0fc48aa4&pbi_source=linkShare"
                target="_blank"
                rel="noreferrer"
              >
                📊 Análisis de Datos PowerBI
              </a>
            </div>
          </div>
        </div>

        <Toaster 
          position="top-right"
          toastOptions={{
            style: { background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(56,189,248,0.3)' },
            success: { style: { background: '#064e3b', color: '#bbf7d0', border: '1px solid rgba(34,197,94,0.5)' } },
            error: { style: { background: '#7f1d1d', color: '#fecaca', border: '1px solid rgba(239,68,68,0.5)' } }
          }}
        />
      </main>
    </>
  );
};

export default ViewDashboard;
