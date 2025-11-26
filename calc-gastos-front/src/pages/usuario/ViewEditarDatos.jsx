// src/pages/editar-datos/ViewEditarDatos.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getData, putData } from '../../api/api';
import { toast } from 'react-toastify';
import Navbar from '../../components/navbar/Navbar';

const ViewEditarDatos = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const normalizeId = (val) => {
    if (!val && val !== 0) return '';
    if (typeof val === 'object' && val !== null) {
      const raw =
        val.$oid ??
        val.$id ??
        val._id ??
        val.id ??
        val.idEstudiante ??
        val.data?.idEstudiante ??
        val.data?._id;
      return raw ? String(raw).trim() : '';
    }
    const s = String(val).trim();
    if (
      !s ||
      s === '-1' ||
      s === 'null' ||
      s === 'undefined' ||
      s === 'NaN' ||
      /^\[object.*\]$/.test(s)
    )
      return '';
    const matchHex = s.match(/[a-fA-F0-9]{24}/);
    if (matchHex && matchHex[0]) return matchHex[0];
    return s;
  };

  const [idEstudiante, setIdEstudiante] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Resolver idEstudiante desde state o localStorage
  useEffect(() => {
    const fromState =
      location.state?.idEstudiante ??
      location.state?.idUsuario ??
      location.state?.userData?.data?.idEstudiante ??
      location.state?.userData?.data?._id;

    let resolved = normalizeId(fromState);
    if (!resolved) {
      try {
        const ls = localStorage.getItem('idEstudiante');
        resolved = normalizeId(ls);
      } catch {}
    }
    setIdEstudiante(resolved);

    try {
      if (resolved) localStorage.setItem('idEstudiante', String(resolved));
      else localStorage.removeItem('idEstudiante');
    } catch {}
  }, [location.state]);

  // Cargar datos del estudiante
  useEffect(() => {
    const load = async () => {
      if (!idEstudiante) {
        setLoading(false);
        return;
      }
      try {
        const resp = await getData(`estudiantes/${idEstudiante}`);
        const est = resp?.data || resp;
        setForm((prev) => ({
          ...prev,
          nombre: est?.nombre || '',
          email: est?.email || '',
          telefono: est?.telefono || '',
          username: est?.username || '',
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!idEstudiante) {
      toast.error('ID de estudiante no disponible');
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const dto = {
        id: idEstudiante,
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        username: form.username,
        password: form.password,
      };
      await putData(`estudiantes/${idEstudiante}`, dto);
      toast.success('Datos actualizados correctamente');
      try {
        localStorage.setItem('idEstudiante', String(idEstudiante));
      } catch {}
      navigate('/home', { state: { idEstudiante } });
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Error al guardar');
      toast.error('No se pudo actualizar los datos');
    } finally {
      setSaving(false);
    }
  };

  /* ==== acciones para el Navbar ==== */
  const handleGoHome = () => {
    if (idEstudiante) {
      navigate('/home', { state: { idEstudiante } });
    } else {
      navigate('/home');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
    } catch {}
    navigate('/login');
  };

  const handleEditProfile = () => {
    // Ya estamos en editar perfil; podemos hacer scroll al inicio si se desea.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading con fondo de la app
  if (loading) {
    return (
      <>
        <Navbar
          userName={form.nombre}
          onHome={handleGoHome}
          onLogout={handleLogout}
          onEditProfile={handleEditProfile}
        />
        <main className="tt-wizard-hero">
          <div className="tt-wizard-stage">
            <div className="tt-loading">
              <div className="spinner-border text-primary" role="status" />
              <span>Cargando datos del perfil...</span>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar
        userName={form.nombre}
        onHome={handleGoHome}
        onLogout={handleLogout}
        onEditProfile={handleEditProfile}
      />

      <main className="tt-wizard-hero">
        <div className="tt-wizard-stage">
          {/* Header */}
          <section className="tt-card-glass" style={{ marginBottom: '16px' }}>
            <span className="tt-chip">PERFIL</span>
            <h1 className="tt-wizard-title">Editar tus datos</h1>
            <p className="tt-wizard-subtitle">
              Actualiza tu información personal y tus credenciales de acceso a
              <strong> Thrifty Tally</strong>.
            </p>
          </section>

          {/* Formulario */}
          <section className="tt-card-glass">
            {error && <p className="tt-alert">{error}</p>}

            {!idEstudiante && (
              <p className="tt-alert">
                No se encontró el identificador del estudiante. Intenta ingresar
                desde el Home.
              </p>
            )}

            <form onSubmit={onSubmit} className="tt-form">
              {/* Datos personales */}
              <div className="tt-section-head" style={{ marginBottom: 10 }}>
                <h2>Información personal</h2>
                <p className="text-muted mb-0">
                  Estos datos nos permiten personalizar tu experiencia.
                </p>
              </div>

              <div className="tt-field">
                <label className="tt-label">Nombre</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={onChange}
                  className="tt-input"
                  placeholder="Tu nombre"
                />
              </div>

              <div className="tt-field">
                <label className="tt-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="tt-input"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="tt-field">
                <label className="tt-label">Teléfono</label>
                <input
                  name="telefono"
                  value={form.telefono}
                  onChange={onChange}
                  className="tt-input"
                  placeholder="Número de contacto"
                />
              </div>

              <hr className="mt-3 mb-3" />

              {/* Credenciales */}
              <div className="tt-section-head" style={{ marginBottom: 10 }}>
                <h2>Credenciales</h2>
                <p className="text-muted mb-0">
                  Si lo deseas, puedes cambiar tu usuario y contraseña.
                </p>
              </div>

              <div className="tt-field">
                <label className="tt-label">Usuario</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  className="tt-input"
                  placeholder="Nuevo usuario"
                />
              </div>

              <div className="tt-field">
                <label className="tt-label">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  className="tt-input"
                  placeholder="Nueva contraseña"
                />
              </div>

              <div
                className="tt-footer-actions"
                style={{ marginTop: '18px', justifyItems: 'stretch' }}
              >
                <button
                  type="submit"
                  className="tt-btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>

                <button
                  type="button"
                  className="tt-btn-ghost"
                  onClick={handleGoHome}
                >
                  Volver al Home
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </>
  );
};

export default ViewEditarDatos;
