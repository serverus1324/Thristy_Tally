import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getData, putData } from '../../api/api';
import { toast } from 'react-toastify';

const ViewEditarDatos = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const normalizeId = (val) => {
    if (!val && val !== 0) return '';
    if (typeof val === 'object' && val !== null) {
      const raw = val.$oid ?? val.$id ?? val._id ?? val.id ?? val.idEstudiante ?? val.data?.idEstudiante ?? val.data?._id;
      return raw ? String(raw).trim() : '';
    }
    const s = String(val).trim();
    if (!s || s === '-1' || s === 'null' || s === 'undefined' || s === 'NaN' || /^\[object.*\]$/.test(s)) return '';
    const matchHex = s.match(/[a-fA-F0-9]{24}/);
    if (matchHex && matchHex[0]) return matchHex[0];
    return s;
  };

  const [idEstudiante, setIdEstudiante] = useState('');
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', username: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fromState = location.state?.idEstudiante
      ?? location.state?.idUsuario
      ?? location.state?.userData?.data?.idEstudiante
      ?? location.state?.userData?.data?._id;
    let resolved = normalizeId(fromState);
    if (!resolved) {
      try { const ls = localStorage.getItem('idEstudiante'); resolved = normalizeId(ls); } catch {}
    }
    setIdEstudiante(resolved);
    try {
      if (resolved) localStorage.setItem('idEstudiante', String(resolved));
      else localStorage.removeItem('idEstudiante');
    } catch {}
  }, [location.state]);

  useEffect(() => {
    const load = async () => {
      if (!idEstudiante) { setLoading(false); return; }
      try {
        const resp = await getData(`estudiantes/${idEstudiante}`);
        const est = resp?.data || resp;
        setForm(prev => ({
          ...prev,
          nombre: est?.nombre || '',
          email: est?.email || '',
          telefono: est?.telefono || ''
        }));
      } catch (e) {
        setError('No se pudo cargar los datos del estudiante.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idEstudiante]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!idEstudiante) { toast.error('ID de estudiante no disponible'); return; }
    setSaving(true);
    setError(null);
    try {
      const dto = {
        id: idEstudiante,
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        username: form.username,
        password: form.password
      };
      await putData(`estudiantes/${idEstudiante}`, dto);
      toast.success('Datos actualizados correctamente');
      try { localStorage.setItem('idEstudiante', String(idEstudiante)); } catch {}
      navigate('/home', { state: { idEstudiante } });
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Error al guardar');
      toast.error('No se pudo actualizar los datos');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando...</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: '720px' }}>
      <h2 className="mb-3">Editar datos del usuario</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {!idEstudiante && <div className="alert alert-warning">No se encontró el identificador del estudiante. Intenta ingresar desde Home.</div>}
      <form onSubmit={onSubmit} className="border rounded p-3 bg-light">
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input name="nombre" value={form.nombre} onChange={onChange} className="form-control" placeholder="Tu nombre" />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" name="email" value={form.email} onChange={onChange} className="form-control" placeholder="tu@email.com" />
        </div>
        <div className="mb-3">
          <label className="form-label">Teléfono</label>
          <input name="telefono" value={form.telefono} onChange={onChange} className="form-control" placeholder="Número de contacto" />
        </div>
        <hr />
        <div className="mb-2 text-muted">Credenciales (usuario y contraseña)</div>
        <div className="mb-3">
          <label className="form-label">Usuario</label>
          <input name="username" value={form.username} onChange={onChange} className="form-control" placeholder="Nuevo usuario" />
        </div>
        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input type="password" name="password" value={form.password} onChange={onChange} className="form-control" placeholder="Nueva contraseña" />
        </div>
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/home', { state: { idEstudiante } })}>Volver al Home</button>
        </div>
      </form>
    </div>
  );
};

export default ViewEditarDatos;