import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getData, putData, postData, deleteData } from '../../api/api';
import { toast } from 'react-toastify';
import "./editarPresupuesto.css";

const EditarPresupuesto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [presupuesto, setPresupuesto] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [necesidades, setNecesidades] = useState([]);
  const [loading, setLoading] = useState(false);

  const [nuevaNecesidad, setNuevaNecesidad] = useState({ descripcion: '', monto: '' });

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const pData = await getData(`presupuestos/${id}`);
        const p = pData?.data || pData;
        setPresupuesto(p);
        setDescripcion(p?.descripcion || '');
        setMonto(p?.monto != null ? String(p.monto) : '');
        const pid = p?.id || p?._id;

        if (pid) {
          const nData = await getData(`necesidades/por-presupuesto?idPresupuesto=${pid}`);
          const arr = Array.isArray(nData?.data) ? nData.data : (Array.isArray(nData) ? nData : []);
          setNecesidades(arr);
        }
      } catch (e) {
        console.error(e);
        toast.error('No se pudo cargar el presupuesto');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  const guardarPresupuesto = async () => {
    if (!presupuesto) return;
    try {
      setLoading(true);
      const presupuestoId = presupuesto?.id || presupuesto?._id;
      if (!presupuestoId) {
        toast.error('ID de presupuesto inválido');
        return;
      }
      const body = {
        id: presupuestoId,
        descripcion,
        monto: parseFloat(monto),
        idEstudiante: presupuesto.idEstudiante,
        idPeriodo: presupuesto.idPeriodo,
      };
      await putData(`presupuestos/${presupuestoId}`, body);
      toast.success('Presupuesto actualizado');
    } catch (e) {
      console.error(e);
      toast.error('Error al actualizar el presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const agregarNecesidad = async () => {
    if (!presupuesto || !nuevaNecesidad.descripcion || !nuevaNecesidad.monto) {
      toast.warning('Completa la necesidad (descripción y monto)');
      return;
    }
    try {
      setLoading(true);
      const presupuestoId = presupuesto?.id || presupuesto?._id;
      if (!presupuestoId) {
        toast.error('ID de presupuesto inválido');
        return;
      }

      const payload = [{
        descripcion: nuevaNecesidad.descripcion,
        monto: parseFloat(nuevaNecesidad.monto),
        esPredeterminada: 0,
        idEstudiante: presupuesto.idEstudiante,
        idPeriodo: presupuesto.idPeriodo,
        idPresupuesto: presupuestoId,
      }];

      await postData('necesidades', payload);
      toast.success('Necesidad agregada');

      const nData = await getData(`necesidades/por-presupuesto?idPresupuesto=${presupuestoId}`);
      const arr = Array.isArray(nData?.data) ? nData.data : (Array.isArray(nData) ? nData : []);
      setNecesidades(arr);
      setNuevaNecesidad({ descripcion: '', monto: '' });
    } catch (e) {
      console.error(e);
      toast.error('Error al agregar necesidad');
    } finally {
      setLoading(false);
    }
  };

  const eliminarNecesidad = async (idNecesidad) => {
    try {
      setLoading(true);
      await deleteData(`necesidades/${idNecesidad}`);
      toast.success('Necesidad eliminada');
      setNecesidades(prev => prev.filter(n => String(n.id || n._id) !== String(idNecesidad)));
    } catch (e) {
      console.error(e);
      toast.error('Error al eliminar necesidad');
    } finally {
      setLoading(false);
    }
  };

  const eliminarPresupuesto = async () => {
    const presupuestoId = presupuesto?.id || presupuesto?._id;
    if (!presupuestoId) return;

    const confirmar = window.confirm(
      '¿Seguro que deseas eliminar este presupuesto? Se eliminarán también todas las necesidades asociadas.'
    );
    if (!confirmar) return;

    try {
      setLoading(true);

      if (necesidades && necesidades.length > 0) {
        for (const necesidad of necesidades) {
          const idNecesidad = necesidad.id || necesidad._id;
          if (idNecesidad) {
            try {
              await deleteData(`necesidades/${idNecesidad}`);
            } catch (e) {
              console.warn(`Error al eliminar necesidad ${idNecesidad}:`, e);
            }
          }
        }
      }

      await deleteData(`presupuestos/${presupuestoId}`);
      toast.success('Presupuesto y necesidades asociadas eliminados');
      navigate('/dashboard', { state: { idEstudiante: presupuesto.idEstudiante } });
    } catch (e) {
      console.error('Error al eliminar presupuesto:', e);
      toast.error('Error al eliminar presupuesto: ' + (e?.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="tt-presupuesto-hero">
        <div className="tt-presupuesto-stage">

          {/* Header superior */}
          <section className="tt-presupuesto-header">
            <div className="tt-presupuesto-header-left">
              <span className="tt-chip">PRESUPUESTO</span>
              <h1 className="tt-title">Editar Presupuesto</h1>
              <p className="tt-subtitle">
                Ajuste la descripción, el monto y gestione las necesidades asociadas.
              </p>
            </div>

            <div className="tt-presupuesto-header-right">
              <button
                className="tt-btn-outline tt-btn-outline-sm"
                onClick={() => {
                  if (presupuesto?.idEstudiante) {
                    navigate('/dashboard', { state: { idEstudiante: presupuesto.idEstudiante } });
                  } else {
                    navigate('/dashboard');
                  }
                }}
                disabled={loading}
              >
                Volver al Dashboard
              </button>
            </div>
          </section>

          {/* Card principal */}
          {presupuesto ? (
            <section className="tt-card tt-card-glass tt-form-card">
              <div className="tt-form-grid">
                <div className="tt-form-group">
                  <label className="tt-label">Descripción</label>
                  <input
                    className="tt-input"
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    placeholder="Ej. Presupuesto semestral"
                  />
                </div>

                <div className="tt-form-group">
                  <label className="tt-label">Monto</label>
                  <input
                    type="number"
                    className="tt-input"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="tt-form-actions">
                <button
                  className="tt-btn-primary"
                  onClick={guardarPresupuesto}
                  disabled={loading}
                >
                  Guardar cambios
                </button>

                <button
                  className="tt-btn-outline"
                  onClick={() => navigate('/dashboard', { state: { idEstudiante: presupuesto.idEstudiante } })}
                  disabled={loading}
                >
                  Volver al Dashboard
                </button>

                <button
                  className="tt-btn-danger"
                  onClick={eliminarPresupuesto}
                  disabled={loading}
                >
                  Eliminar Presupuesto
                </button>
              </div>

              {loading && (
                <p className="tt-loading-inline">Procesando cambios...</p>
              )}
            </section>
          ) : (
            <section className="tt-card tt-card-glass">
              <p className="tt-muted">No se encontró el presupuesto.</p>
            </section>
          )}

          {/* Necesidades del presupuesto */}
          <section className="tt-card tt-card-glass tt-needs-card">
            <div className="tt-section-head-dark">
              <h2>Necesidades del Presupuesto</h2>
              <p className="tt-muted">Agregue o elimine necesidades del período.</p>
            </div>

            <div className="tt-needs-form">
              <input
                className="tt-input"
                placeholder="Descripción"
                value={nuevaNecesidad.descripcion}
                onChange={e => setNuevaNecesidad({ ...nuevaNecesidad, descripcion: e.target.value })}
              />

              <input
                type="number"
                className="tt-input"
                placeholder="Monto"
                value={nuevaNecesidad.monto}
                onChange={e => setNuevaNecesidad({ ...nuevaNecesidad, monto: e.target.value })}
                min="0"
                step="0.01"
              />

              <button
                className="tt-btn-success"
                onClick={agregarNecesidad}
                disabled={loading}
              >
                Agregar
              </button>
            </div>

            <div className="tt-needs-list">
              {necesidades && necesidades.length > 0 ? (
                necesidades.map((n) => {
                  const nid = String(n.id || n._id);
                  const estado = typeof n?.esPredeterminada === 'number'
                    ? (n.esPredeterminada === 1 ? 'Predeterminada' : 'Establecida')
                    : (n?.estado || '—');

                  return (
                    <div key={nid} className="tt-need-item">
                      <div className="tt-need-info">
                        <strong className="tt-need-title">{n.descripcion || n.nombre}</strong>
                        <div className="tt-need-meta">
                          <span>Monto: ${Number(n.monto || n.montoSolicitado || 0).toFixed(2)}</span>
                          <span>Estado: {estado}</span>
                        </div>
                      </div>

                      <button
                        className="tt-btn-danger tt-btn-danger-sm"
                        onClick={() => eliminarNecesidad(nid)}
                        disabled={loading}
                      >
                        Eliminar
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="tt-muted">No hay necesidades registradas para este presupuesto.</p>
              )}
            </div>
          </section>

        </div>
      </main>
    </>
  );
};

export default EditarPresupuesto;
