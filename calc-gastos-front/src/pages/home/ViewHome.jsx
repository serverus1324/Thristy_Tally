import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getData } from '../../api/api';
import Navbar from '../../components/navbar/Navbar';

const ViewHome = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [idEstudiante, setIdEstudiante] = useState(location.state?.idEstudiante || -2);
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

        if (idEstudiante) {
            fetchUserData();
        }
    }, [idEstudiante]);

    if (loading) {
        return <div className="text-center mt-5">Cargando datos del usuario...</div>;
    }

    if (error) {
        return <div className="text-center mt-5 text-danger">{error}</div>;
    }

    const toDashboard = () => {
        navigate('/dashboard', { state: { userData } });
    }

    const toCreateGasto = () => {
        navigate('/crear-gasto', { state: { userData } });
    }

    return (
        <>
            <Navbar userName={userData?.nombre} /> {/* Modificado para acceder al nombre directamente */}
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
                        </div>
                    </div>
                ) : (
                    <div className="text-center mt-4">No se encontró información del usuario.</div>
                )}
            </div>
        </>
    );
};

export default ViewHome;