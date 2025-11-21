import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getData } from '../../api/api';
import Navbar from '../../components/navbar/Navbar';

const ViewHome = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [idEstudiante, setIdEstudiante] = useState(() => {
        const fromState = location.state?.idEstudiante;
        let fromStorage = null;
        try { fromStorage = localStorage.getItem('idEstudiante'); } catch {}
        return fromState ?? fromStorage ?? null;
    });
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // const data = await getData(`estudiantes/${idEstudiante}`);
                console.log("idEstudiante: ", idEstudiante);
                const data = await getData(`estudiantes/${idEstudiante}`);
                console.log("data estudiante: ", data);
                setUserData(data); // Almacena los datos obtenidos
            } catch (err) {
                setError('Error al obtener los datos del usuario.');
            } finally {
                setLoading(false);
            }
        };

        if (idEstudiante && idEstudiante !== -2 && idEstudiante !== '-2') {
            fetchUserData();
        }
    }, [idEstudiante]);

    if (loading) {
        return <div className="text-center mt-5">Cargando datos del usuario...</div>;
    }

    if (error) {
        return (
            <div className="text-center mt-5">
                <div className="text-danger mb-3">{error}</div>
                <button className="btn btn-primary" onClick={() => navigate('/login')}>Ir a iniciar sesión</button>
            </div>
        );
    }

    const toDashboard = () => {
        navigate('/dashboard', { state: { userData } });
    }

    const toCreateGasto = () => {
        let idFromStorage = null;
        try { idFromStorage = localStorage.getItem('idEstudiante'); } catch {}
        const idE = (idFromStorage && String(idFromStorage).trim()) || (userData?.data?.idEstudiante ? String(userData.data.idEstudiante) : '');
        if (idE) {
            try { localStorage.setItem('idEstudiante', String(idE)); } catch {}
            // Mantener la misma forma que usa el dashboard: idUsuario
            navigate('/crear-gasto', { state: { idUsuario: String(idE) } });
        } else {
            navigate('/crear-gasto');
        }
    }

    const toCompareBudgets = () => {
        let idFromStorage = null;
        try { idFromStorage = localStorage.getItem('idEstudiante'); } catch {}
        const idE = (idFromStorage && String(idFromStorage).trim()) || (userData?.data?.idEstudiante ? String(userData.data.idEstudiante) : '');
        if (idE) {
            try { localStorage.setItem('idEstudiante', String(idE)); } catch {}
            navigate('/comparar-presupuestos', { state: { idUsuario: String(idE), idEstudiante: String(idE) } });
        } else {
            navigate('/comparar-presupuestos');
        }
    }

    const toPrediction = () => {
        // Navegar al nuevo apartado de predicción
        let idFromStorage = null;
        try { idFromStorage = localStorage.getItem('idEstudiante'); } catch {}
        const idE = (idFromStorage && String(idFromStorage).trim()) || (userData?.data?.idEstudiante ? String(userData.data.idEstudiante) : '');
        if (idE) {
            try { localStorage.setItem('idEstudiante', String(idE)); } catch {}
            navigate('/prediccion-necesidades', { state: { idUsuario: String(idE), idEstudiante: String(idE) } });
        } else {
            navigate('/prediccion-necesidades');
        }
    }

    return (
        <>
            <Navbar userName={userData?.data || { nombre: '' }} />
            <div className="container mt-5">
                <h1 className="text-primary text-center">Bienvenido de nuevo</h1>
                {userData ? (
                    <div className="mt-4">
                        <h2 className="text-secondary text-center">¿Qué deseas hacer?</h2>
                        <div className="d-flex flex-column align-items-center gap-3 mt-5">
                            <button onClick={toDashboard} className="btn btn-lg btn-outline-primary d-flex align-items-center justify-content-center gap-2">
                                <img src="/view.png" alt="Ver Gastos" style={{ width: '24px', height: '24px' }} />
                                Ver gastos creados
                            </button>
                            <button onClick={toCreateGasto} className="btn btn-lg btn-outline-success d-flex align-items-center justify-content-center gap-2">
                                <img src="/add.png" alt="Crear Gasto" style={{ width: '24px', height: '24px' }} />
                                Crear nuevo gasto
                            </button>
                            <button onClick={toCompareBudgets} className="btn btn-lg btn-outline-warning d-flex align-items-center justify-content-center gap-2">
                                <img src="/view.png" alt="Comparar Presupuestos" style={{ width: '24px', height: '24px' }} />
                                Comparar presupuestos
                            </button>
                            <button onClick={toPrediction} className="btn btn-lg btn-outline-info d-flex align-items-center justify-content-center gap-2">
                                <img src="/view.png" alt="Predicción de necesidades" style={{ width: '24px', height: '24px' }} />
                                Predicción de necesidades
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center mt-4">No se encontró información del usuario. Por favor, inicia sesión o vuelve desde el formulario.</div>
                )}
            </div>
        </>
    );
};

export default ViewHome;