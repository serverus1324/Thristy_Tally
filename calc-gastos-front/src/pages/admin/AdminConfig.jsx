import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patchData } from '../../api/api';
import toast from 'react-hot-toast';
import '../../components/admin/AdminStyles.css';

const AdminConfig = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        username: '',
        email: '',
        password: ''
    });

    // Sincronizar formulario con los datos reales del usuario cuando carguen
    React.useEffect(() => {
        if (user) {
            setForm({
                nombre: user.nombre || '',
                username: user.username || '',
                email: user.email || '',
                password: ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const cambios = {};
        if (form.nombre !== user.nombre) cambios.nombre = form.nombre;
        if (form.username !== user.username) cambios.username = form.username;
        if (form.email !== user.email) cambios.email = form.email;
        if (form.password) cambios.password = form.password;

        if (Object.keys(cambios).length === 0) {
            toast.error("No hay cambios para guardar");
            setLoading(false);
            return;
        }

        try {
            const resp = await patchData(`usuarios/${user.idUsuario}`, cambios);
            if (resp.success) {
                toast.success("Perfil actualizado correctamente");
                // Actualizar contexto si es necesario
                login({ ...user, ...cambios });
                setForm({ ...form, password: '' });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al actualizar perfil");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-view">
            <div className="admin-header">
                <div className="admin-welcome">
                    <h1>Configuración</h1>
                    <p>Actualiza tus datos de acceso y perfil de administrador</p>
                </div>
            </div>

            <div className="admin-card" style={{ maxWidth: '600px' }}>
                <form className="admin-config-form" onSubmit={handleSubmit}>
                    <div className="admin-input-group">
                        <label className="admin-label">Nombre Completo</label>
                        <input 
                            type="text" 
                            name="nombre" 
                            value={form.nombre} 
                            onChange={handleChange}
                            className="admin-input"
                        />
                    </div>
                    <div className="admin-input-group">
                        <label className="admin-label">Nombre de Usuario</label>
                        <input 
                            type="text" 
                            name="username" 
                            value={form.username} 
                            onChange={handleChange}
                            className="admin-input"
                        />
                    </div>
                    <div className="admin-input-group">
                        <label className="admin-label">Correo Electrónico</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={form.email} 
                            onChange={handleChange}
                            className="admin-input"
                        />
                    </div>
                    <div className="admin-input-group">
                        <label className="admin-label">Nueva Contraseña (dejar en blanco para no cambiar)</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={form.password} 
                            onChange={handleChange}
                            className="admin-input"
                        />
                    </div>
                    <div style={{ marginTop: '12px' }}>
                        <button 
                            type="submit" 
                            className="admin-btn admin-btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminConfig;
