import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { postData } from '../../api/api'; // Importa las funciones de api.js

const ViewLogin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        if (username === '' || password === '') {
            toast.error('Todos los campos son obligatorios');
            return;
        }

        try {
            const body = { username, password };
            const response = await postData ('usuarios/login', body); // La ruta debe coincidir con la de Spring
            const idEstudiante = response.idEstudiante;
            console.log(("response login: ", response))
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
