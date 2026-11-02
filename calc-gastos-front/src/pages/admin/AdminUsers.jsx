import React, { useState, useEffect } from 'react';
import { getData, patchData } from '../../api/api';
import toast from 'react-hot-toast';
import '../../components/admin/AdminStyles.css';

const IconSort = ({ active, direction }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="14" height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        style={{ 
            marginLeft: '6px', 
            opacity: active ? 1 : 0.2, 
            transition: 'all 0.2s',
            transform: direction === 'desc' ? 'rotate(180deg)' : 'none'
        }}
    >
        <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
);

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usuarioEnEdicion, setUsuarioEnEdicion] = useState(null);
    const [editForm, setEditForm] = useState({ username: "", email: "", nombre: "", password: "" });
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);
    
    // Filtros y Ordenamiento
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getData("usuarios");
            setUsers(Array.isArray(data?.data) ? data.data : []);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("No se pudo cargar la lista de usuarios");
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredUsers = React.useMemo(() => {
        let filtered = users.filter(user => {
            const search = searchTerm.toLowerCase();
            return (
                (user.nombre || "").toLowerCase().includes(search) ||
                (user.username || "").toLowerCase().includes(search) ||
                (user.email || "").toLowerCase().includes(search)
            );
        });

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                // Tratamiento especial para campos anidados o calculados
                if (sortConfig.key === 'rol') {
                    valA = a.roles?.includes("ROLE_ADMIN") ? "Admin" : "Usuario";
                    valB = b.roles?.includes("ROLE_ADMIN") ? "Admin" : "Usuario";
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [users, searchTerm, sortConfig]);

    const toggleUserActive = async (user) => {
        try {
            const nuevoEstado = !user.activo;
            await patchData(`usuarios/${user._id}/activo`, { activo: nuevoEstado });
            setUsers((prev) =>
                prev.map((u) => (u._id === user._id ? { ...u, activo: nuevoEstado } : u))
            );
            toast.success("Estado del usuario actualizado");
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar estado");
        }
    };

    const toggleUserAdmin = async (user) => {
        const esAdmin = (user.roles || []).includes("ROLE_ADMIN");
        const nuevosRoles = esAdmin ? ["ROLE_USER"] : ["ROLE_USER", "ROLE_ADMIN"];
        try {
            await patchData(`usuarios/${user._id}/rol`, { roles: nuevosRoles });
            setUsers((prev) =>
                prev.map((u) => (u._id === user._id ? { ...u, roles: nuevosRoles } : u))
            );
            toast.success(esAdmin ? "Rol admin retirado" : "Promovido a admin");
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar rol");
        }
    };

    const abrirEdicion = (user) => {
        setUsuarioEnEdicion(user);
        setEditForm({
            username: user.username || "",
            email: user.email || "",
            nombre: user.nombre || "",
            password: ""
        });
    };

    const cerrarEdicion = () => {
        setUsuarioEnEdicion(null);
        setEditForm({ username: "", email: "", nombre: "", password: "" });
    };

    const onEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const guardarEdicion = async (e) => {
        e.preventDefault();
        setGuardandoEdicion(true);
        try {
            const cambios = {};
            if (editForm.username !== usuarioEnEdicion.username) cambios.username = editForm.username;
            if (editForm.email !== usuarioEnEdicion.email) cambios.email = editForm.email;
            if (editForm.nombre !== usuarioEnEdicion.nombre) cambios.nombre = editForm.nombre;
            if (editForm.password) cambios.password = editForm.password;

            await patchData(`usuarios/${usuarioEnEdicion._id}`, cambios);
            toast.success("Usuario actualizado");
            fetchUsers();
            cerrarEdicion();
        } catch (error) {
            console.error(error);
            toast.error("Error al actualizar usuario");
        } finally {
            setGuardandoEdicion(false);
        }
    };

    return (
        <div className="admin-view">
            <div className="admin-header">
                <div className="admin-welcome">
                    <h1>Usuarios</h1>
                    <p>Gestiona los accesos y roles de los usuarios de la plataforma</p>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-card-header">
                    <h2 className="admin-card-title">Listado de Usuarios</h2>
                    <div className="tt-search-wrap" style={{ maxWidth: '300px' }}>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, usuario o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-input"
                            style={{ width: '100%', height: '42px', fontSize: '14px' }}
                        />
                    </div>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('nombre')} style={{ cursor: 'pointer' }}>
                                Usuario <IconSort active={sortConfig.key === 'nombre'} direction={sortConfig.direction} />
                            </th>
                            <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                                Correo <IconSort active={sortConfig.key === 'email'} direction={sortConfig.direction} />
                            </th>
                            <th onClick={() => handleSort('rol')} style={{ cursor: 'pointer' }}>
                                Rol <IconSort active={sortConfig.key === 'rol'} direction={sortConfig.direction} />
                            </th>
                            <th onClick={() => handleSort('activo')} style={{ cursor: 'pointer' }}>
                                Estado <IconSort active={sortConfig.key === 'activo'} direction={sortConfig.direction} />
                            </th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center">Cargando...</td></tr>
                        ) : sortedAndFilteredUsers.length === 0 ? (
                            <tr><td colSpan="5" className="text-center">No se encontraron usuarios</td></tr>
                        ) : sortedAndFilteredUsers.map(user => (
                            <tr key={user._id}>
                                <td>
                                    <div className="admin-user-info">
                                        <div className="admin-user-avatar">
                                            {(user.nombre || user.username || "?")[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{user.nombre || "Sin nombre"}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>@{user.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`admin-status-pill ${user.roles?.includes("ROLE_ADMIN") ? 'admin-status-active' : ''}`} style={{ backgroundColor: user.roles?.includes("ROLE_ADMIN") ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)', color: user.roles?.includes("ROLE_ADMIN") ? '#3b82f6' : '#94a3b8' }}>
                                        {user.roles?.includes("ROLE_ADMIN") ? 'Admin' : 'Usuario'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`admin-status-pill ${user.activo ? 'admin-status-active' : 'admin-status-inactive'}`}>
                                        {user.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="admin-btn admin-btn-outline" onClick={() => abrirEdicion(user)}>Editar</button>
                                        <button className="admin-btn admin-btn-outline" onClick={() => toggleUserAdmin(user)}>
                                            {user.roles?.includes("ROLE_ADMIN") ? 'Quitar Admin' : 'Hacer Admin'}
                                        </button>
                                        <button className="admin-btn admin-btn-outline" onClick={() => toggleUserActive(user)}>
                                            {user.activo ? 'Desactivar' : 'Activar'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {usuarioEnEdicion && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="admin-card" style={{ width: '400px' }}>
                        <h3>Editar Usuario</h3>
                        <form className="admin-config-form" onSubmit={guardarEdicion}>
                            <div className="admin-input-group">
                                <label className="admin-label">Nombre</label>
                                <input name="nombre" value={editForm.nombre} onChange={onEditChange} className="admin-input" />
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">Username</label>
                                <input name="username" value={editForm.username} onChange={onEditChange} className="admin-input" />
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">Email</label>
                                <input name="email" value={editForm.email} onChange={onEditChange} className="admin-input" />
                            </div>
                            <div className="admin-input-group">
                                <label className="admin-label">Nueva Contraseña</label>
                                <input type="password" name="password" value={editForm.password} onChange={onEditChange} className="admin-input" />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" className="admin-btn admin-btn-primary" disabled={guardandoEdicion}>Guardar</button>
                                <button type="button" className="admin-btn admin-btn-outline" onClick={cerrarEdicion}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
