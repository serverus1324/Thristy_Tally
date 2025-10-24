import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { getData, postData } from '../../api/api'; // Importa las funciones de api.js


const ViewSignup = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const sendData = async (e) => {
        e.preventDefault();

        if (name === '' || email === '' || phone === '' || username === '' || password === '') {
            toast.error('Todos los campos son obligatorios');
            return;
        }
        try {
            const existeUsuarioResponse = await getData(`usuarios/existe/${username}`);
            console.log("Respuesta del backend:", existeUsuarioResponse);
        
            if (existeUsuarioResponse.data === true) {
                toast.error('El nombre de usuario ya existe. Si tiene una cuenta, inicie sesión');
                return;
            }
        } catch (error) {
            console.error("Error al verificar usuario:", error);
            toast.error(error.message || 'Error al verificar usuario');
            return;
        }
        
        const body = {
            nombre: name,
            email: email,
            telefono: phone,
            username: username,
            password: password,
        };

        try {
            const response = await postData('estudiantes/', body); // Usa postData
            console.log("Respuesta del backend:", response);
            toast.success('Usuario creado exitosamente');
            setTimeout(() => {
                navigate('/login', { state: { username } });
            }, 800);
        } catch (error) {
            console.error("Error al crear usuario:", error);
            toast.error(error.message || 'Error al crear usuario');
            return;
        }
    };

    return (
        <>
            <form onSubmit={sendData} className="container mt-5 p-4 border rounded bg-light" style={{ maxWidth: '500px' }}>
                <h2 className="text-center fw-bold text-primary mb-4">Regístrate</h2>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                        Nombre completo
                    </label>
                    <input
                        type="text"
                        id="name"
                        className="form-control"
                        placeholder="Ingresa tu nombre completo"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                        Correo electrónico
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="form-control"
                        placeholder="Ingresa tu correo electrónico"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                        Teléfono
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        className="form-control"
                        placeholder="Ingresa tu número de teléfono"
                        maxLength={12}
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                        Nombre de usuario
                    </label>
                    <input
                        type="text"
                        id="username"
                        className="form-control"
                        placeholder="Crea un nombre de usuario"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                        placeholder="Crea una contraseña segura"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                    Crear cuenta
                </button>
            </form>
            <div className="text-center mt-3">
                <p>
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="text-primary">
                        Inicia Sesión
                    </Link>
                </p>
            </div>
            <Toaster />
        </>
    );
};

export default ViewSignup;