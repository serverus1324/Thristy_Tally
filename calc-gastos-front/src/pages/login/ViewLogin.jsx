import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { postData } from '../../api/api'; // Importa las funciones de api.js

const ViewLogin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Normalización robusta del ID de estudiante proveniente del backend
    const normalizeId = (val) => {
        if (!val) return '';
        if (typeof val === 'string') {
            const s = val.trim();
            if (s === 'null' || s === 'undefined' || s === 'NaN') return '';
            // Intentar parsear JSON con $oid
            if (s.startsWith('{') && s.endsWith('}')) {
                try {
                    const obj = JSON.parse(s);
                    const raw = obj.$oid ?? obj.$id ?? obj._id ?? obj.oid ?? obj.id;
                    if (raw) return String(raw).trim();
                } catch {}
            }
            // Extraer 24-hex si aparece dentro de la cadena
            const matchHex = s.match(/[a-fA-F0-9]{24}/);
            if (matchHex && matchHex[0]) return matchHex[0];
            // Extraer números si es numérico
            const matchNum = s.match(/\d{1,}/);
            if (matchNum && matchNum[0]) return matchNum[0];
            return s;
        }
        if (typeof val === 'number') return String(val);
        if (typeof val === 'object') {
            const raw = val?.$oid ?? val?.$id ?? val?._id ?? val?.oid ?? val?.id ?? val?.data?.idEstudiante ?? val?.data?._id;
            if (!raw) return '';
            return typeof raw === 'string' || typeof raw === 'number' ? String(raw) : '';
        }
        return '';
    };

    const isValidId = (v) => typeof v === 'string' && (/^[a-fA-F0-9]{24}$/.test(v) || /^\d+$/.test(v));

    const handleLogin = async (e) => {
        e.preventDefault();

        if (username === '' || password === '') {
            toast.error('Todos los campos son obligatorios');
            return;
        }

        try {
            const body = { username, password };
            const response = await postData ('usuarios/login', body); // La ruta debe coincidir con la de Spring
            console.log('response login:', response);
            const rawId = response?.idEstudiante ?? response?.data?.idEstudiante ?? response?._id ?? response?.id;
            const idEstudiante = normalizeId(rawId);
            if (!isValidId(idEstudiante)) {
                toast.error('ID de estudiante inválido en login.');
                return;
            }
            // Persistir sesión con el ID real del estudiante
            try { localStorage.setItem('idEstudiante', String(idEstudiante)); } catch {}

            toast.success('Inicio de sesión exitoso');
            setTimeout(() => {
                navigate('/home', { state: { idEstudiante } });
            }, 800);
        
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            toast.error(error.mensaje || 'Error al iniciar sesión'); // Accede al mensaje del error
        }
    }
    return (
        <>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <h2 className="text-center text-primary fw-bold mb-4">Iniciar Sesión</h2>
                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label">
                                    Nombre de Usuario
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    className="form-control"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Ingresa tu nombre de usuario"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ingresa tu contraseña"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">
                                Iniciar Sesión
                            </button>
                        </form>
                        <div className="text-center mt-3">
                            <p>
                                ¿No tienes una cuenta?{' '}
                                <Link to="/signup" className="text-primary">
                                    Regístrate
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster />
        </>
    );
};

export default ViewLogin;
