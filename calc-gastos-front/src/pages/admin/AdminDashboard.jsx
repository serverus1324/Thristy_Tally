import React, { useState, useEffect } from 'react';
import { getAdminDashboardMetrics, getModeloStatus } from '../../api/api';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import '../../components/admin/AdminStyles.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const IconUsers = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

const IconTarget = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
);

const IconWallet = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
);

const IconBot = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
);

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [latestUsers, setLatestUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modelStatus, setModelStatus] = useState(null);
    const [modelLoading, setModelLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
        fetchModelStatus();
    }, []);

    const fetchMetrics = async () => {
        try {
            const data = await getAdminDashboardMetrics();
            setMetrics(data.data);
            setLatestUsers(data.ultimosUsuarios || []);
        } catch (error) {
            console.error("Error fetching metrics:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchModelStatus = async () => {
        try {
            const data = await getModeloStatus();
            setModelStatus(data);
        } catch (error) {
            console.error("Error fetching model status:", error);
        } finally {
            setModelLoading(false);
        }
    };

    const lineData = {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
            {
                label: 'Usuarios',
                data: [12, 19, 3, 5, 2, 3, 7],
                borderColor: '#3b82f6',
                tension: 0.4,
            },
            {
                label: 'Consultas',
                data: [2, 3, 20, 5, 1, 4, 10],
                borderColor: '#8b5cf6',
                tension: 0.4,
            }
        ],
    };

    const doughnutData = {
        labels: ['Activos', 'Inactivos'],
        datasets: [
            {
                data: [metrics?.usuariosActivos || 0, (metrics?.usuariosTotales - metrics?.usuariosActivos) || 0],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="admin-view">
            <div className="admin-header">
                <div className="admin-welcome">
                    <h1>Dashboard</h1>
                    <p>Resumen general del estado de la plataforma Thrifty Tally</p>
                </div>
            </div>

            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <span className="admin-stat-title">Usuarios Totales</span>
                        <div className="admin-stat-icon"><IconUsers /></div>
                    </div>
                    <div className="admin-stat-value">{loading ? '...' : metrics?.usuariosTotales}</div>
                    <div className="admin-stat-footer">
                        <span>↑ 12%</span> vs mes anterior
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <span className="admin-stat-title">Necesidades</span>
                        <div className="admin-stat-icon"><IconTarget /></div>
                    </div>
                    <div className="admin-stat-value">{loading ? '...' : metrics?.totalNecesidades}</div>
                    <div className="admin-stat-footer">
                        <span>↑ 8%</span> vs mes anterior
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <span className="admin-stat-title">Presupuestos</span>
                        <div className="admin-stat-icon"><IconWallet /></div>
                    </div>
                    <div className="admin-stat-value">{loading ? '...' : metrics?.totalPresupuestos}</div>
                    <div className="admin-stat-footer">
                        <span>↑ 5%</span> vs mes anterior
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-header">
                        <span className="admin-stat-title">Consultas IA</span>
                        <div className="admin-stat-icon"><IconBot /></div>
                    </div>
                    <div className="admin-stat-value">{loading ? '...' : metrics?.totalConsultas}</div>
                    <div className="admin-stat-footer">
                        <span>↑ 24%</span> vs mes anterior
                    </div>
                </div>
            </div>

            <div className="admin-content-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '24px' }}>
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h2 className="admin-card-title">Evolución de Actividad</h2>
                    </div>
                    <div style={{ height: '250px' }}>
                        <Line data={lineData} options={{ maintainAspectRatio: false, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
                    </div>
                </div>
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h2 className="admin-card-title">Distribución de Usuarios</h2>
                    </div>
                    <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
                    </div>
                </div>
            </div>

            <div className="admin-content-grid">
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h2 className="admin-card-title">Estado del Sistema</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                                <span>Backend (Spring Boot)</span>
                            </div>
                            <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 600 }}>En línea</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                                <span>Base de Datos (MongoDB)</span>
                            </div>
                            <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 600 }}>Conectado</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: modelStatus?.ready ? '#10b981' : '#f59e0b' }}></div>
                                <span>Modelo IA (J48)</span>
                            </div>
                            <span style={{ color: modelStatus?.ready ? '#10b981' : '#f59e0b', fontSize: '13px', fontWeight: 600 }}>
                                {modelLoading ? '...' : (modelStatus?.ready ? 'Listo' : 'No disponible')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="admin-card">
                    <div className="admin-card-header">
                        <h2 className="admin-card-title">Resumen IA</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="admin-metric-card" style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.4)' }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Clase objetivo</div>
                            <div style={{ fontWeight: 600 }}>{modelStatus?.classAttribute || '—'}</div>
                        </div>
                        <div className="admin-metric-card" style={{ padding: '12px', background: 'rgba(15, 23, 42, 0.4)' }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Atributos</div>
                            <div style={{ fontWeight: 600 }}>{modelStatus?.numAttributes || '—'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-card" style={{ marginTop: '24px' }}>
                <div className="admin-card-header">
                    <h2 className="admin-card-title">Últimos usuarios registrados</h2>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Email</th>
                                <th>Roles</th>
                            </tr>
                        </thead>
                        <tbody>
                            {latestUsers.map(u => (
                                <tr key={u._id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{u.nombre || u.username}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>@{u.username}</div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>{u.roles?.join(', ')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
