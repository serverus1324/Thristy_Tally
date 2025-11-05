import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getData, putData, postData, deleteData } from '../../api/api';
import { toast } from 'react-toastify';

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
        const p = pData?.data || pData; // algunos controladores devuelven {data}
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
        descripcion: descripcion,
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
      // recargar por presupuesto
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
    const confirmar = window.confirm('¿Seguro que deseas eliminar este presupuesto? Se eliminarán también todas las necesidades asociadas.');
    if (!confirmar) return;
    try {
      setLoading(true);
      
      // Primero eliminar todas las necesidades asociadas al presupuesto
      if (necesidades && necesidades.length > 0) {
        console.log('Eliminando necesidades asociadas...');
        for (const necesidad of necesidades) {
          const idNecesidad = necesidad.id || necesidad._id;
          if (idNecesidad) {
            try {
              await deleteData(`necesidades/${idNecesidad}`);
              console.log(`Necesidad ${idNecesidad} eliminada`);
            } catch (e) {
              console.warn(`Error al eliminar necesidad ${idNecesidad}:`, e);
            }
          }
        }
      }
      
      // Luego eliminar el presupuesto
      console.log('Eliminando presupuesto...');
      await deleteData(`presupuestos/${presupuestoId}`);
      toast.success('Presupuesto y necesidades asociadas eliminados exitosamente');
      navigate('/dashboard', { state: { idEstudiante: presupuesto.idEstudiante } });
    } catch (e) {
      console.error('Error al eliminar presupuesto:', e);
      toast.error('Error al eliminar presupuesto: ' + (e?.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 mb-5" style={{maxWidth:'840px'}}>
      <h2 className="mb-3">Editar Presupuesto</h2>
      {loading && <p className="text-info">Cargando...</p>}
      {presupuesto ? (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <input className="form-control" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Monto</label>
              <input type="number" className="form-control" value={monto} onChange={e => setMonto(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={guardarPresupuesto} disabled={loading}>Guardar cambios</button>
            <button className="btn btn-secondary ms-2" onClick={() => navigate('/dashboard', { state: { idEstudiante: presupuesto.idEstudiante } })}>Volver al Dashboard</button>
            <button className="btn btn-outline-danger ms-2" onClick={eliminarPresupuesto} disabled={loading}>Eliminar Presupuesto</button>
          </div>
        </div>
      ) : (
        <p className="text-muted">No se encontró el presupuesto.</p>
      )}

      <hr className="my-4" />
      <h3 className="h5">Necesidades del Presupuesto</h3>
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-6">
              <input className="form-control" placeholder="Descripción" value={nuevaNecesidad.descripcion} onChange={e => setNuevaNecesidad({...nuevaNecesidad, descripcion: e.target.value})} />
            </div>
            <div className="col-md-4">
              <input type="number" className="form-control" placeholder="Monto" value={nuevaNecesidad.monto} onChange={e => setNuevaNecesidad({...nuevaNecesidad, monto: e.target.value})} />
            </div>
            <div className="col-md-2 d-grid">
              <button className="btn btn-success" onClick={agregarNecesidad} disabled={loading}>Agregar</button>
            </div>
          </div>
        </div>
      </div>

      <ul className="list-group">
        {necesidades && necesidades.length > 0 ? necesidades.map((n) => (
          <li key={String(n.id || n._id)} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{n.descripcion || n.nombre}</strong>
              <div className="small text-muted">Monto: ${Number(n.monto || n.montoSolicitado || 0).toFixed(2)}</div>
              <div className="small">Estado: {typeof n?.esPredeterminada === 'number' ? (n.esPredeterminada === 1 ? 'Predeterminada' : 'Establecida') : (n?.estado || '—')}</div>
            </div>
            <button className="btn btn-outline-danger btn-sm" onClick={() => eliminarNecesidad(String(n.id || n._id))}>Eliminar</button>
          </li>
        )) : <li className="list-group-item text-muted">No hay necesidades registradas para este presupuesto.</li>}
      </ul>
    </div>
  );
};

export default EditarPresupuesto;