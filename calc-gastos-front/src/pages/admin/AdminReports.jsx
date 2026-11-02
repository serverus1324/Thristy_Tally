import React, { useState, useEffect } from 'react';
import { getChatHistorial } from '../../api/api';
import '../../components/admin/AdminStyles.css';

const AdminReports = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQueries();
    }, []);

    const fetchQueries = async () => {
        try {
            const data = await getChatHistorial();
            setQueries(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching queries:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-view">
            <div className="admin-header">
                <div className="admin-welcome">
                    <h1>Reportes y Consultas</h1>
                    <p>Monitoreo de interacciones de los usuarios con el asistente IA</p>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-card-header">
                    <h2 className="admin-card-title">Historial de Consultas RAG</h2>
                </div>
                
                <div style={{ overflowX: "auto" }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Pregunta</th>
                                <th>Respuesta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="3">Cargando consultas...</td></tr>
                            ) : queries.length === 0 ? (
                                <tr><td colSpan="3">No hay consultas registradas.</td></tr>
                            ) : (
                                queries.map((q, idx) => (
                                    <tr key={q.id || idx}>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: '#94a3b8' }}>
                                            {new Date(q.fecha).toLocaleString()}
                                        </td>
                                        <td style={{ maxWidth: '300px' }}>{q.pregunta}</td>
                                        <td style={{ maxWidth: '400px', fontSize: '13px' }}>
                                            <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                                {q.respuesta}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="admin-card" style={{ marginTop: '24px' }}>
                <div className="admin-card-header">
                    <h2 className="admin-card-title">Quejas y Soporte</h2>
                    <span className="admin-status-pill admin-status-inactive">Próximamente</span>
                </div>
                <p style={{ color: '#94a3b8' }}>
                    Este módulo permitirá visualizar los tickets de soporte y quejas enviados por los usuarios.
                </p>
            </div>
        </div>
    );
};

export default AdminReports;
