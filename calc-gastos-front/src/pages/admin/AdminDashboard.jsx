import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { getAdminDashboardMetrics } from "../../api/api";
import Navbar from "../../components/navbar/Navbar";
import "../recover-password/recover-password.css";

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([
        { id: 1, name: "Ana García", email: "ana@email.com", active: true },
        { id: 2, name: "Carlos López", email: "carlos@email.com", active: true },
        { id: 3, name: "María Rodríguez", email: "maria@email.com", active: true },
        { id: 4, name: "Pedro Martínez", email: "pedro@email.com", active: false },
    ]);
    const [modelTraining, setModelTraining] = useState(false);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const data = await getAdminDashboardMetrics();
                setMetrics(data.data);
            } catch (error) {
                console.error("Error fetching metrics:", error);
                // Fallback to default metrics
                setMetrics({
                    usuariosTotales: 120,
                    modelosEntrenados: 4,
                    logsErrores: 0
                });
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    const toggleUserActive = (userId) => {
        setUsers(users.map(user => 
            user.id === userId ? { ...user, active: !user.active } : user
        ));
        toast.success("Estado del usuario actualizado");
    };

    const retrainModel = () => {
        setModelTraining(true);
        toast.success("Reentrenamiento del modelo iniciado...");
        
        // Simulate training
        setTimeout(() => {
            setModelTraining(false);
            toast.success("Modelo reentrenado exitosamente");
        }, 3000);
    };

    return (
        <div className="admin-dashboard">
            <Navbar userName={{ nombre: "Admin" }} />
            
            <div style={{ marginTop: "40px" }}>
                <div className="admin-dashboard-header">
                    <h1 className="admin-dashboard-title">Panel de Administración</h1>
                    <p className="admin-dashboard-subtitle">Gestiona usuarios, modelos y métricas de la plataforma</p>
                </div>

                <div className="admin-grid">
                    {/* Card 1: Gestión de Usuarios */}
                    <div className="admin-card" style={{ gridColumn: "span 2" }}>
                        <div className="admin-card-header">
                            <h2 className="admin-card-title">Gestión de Usuarios</h2>
                            <div className="admin-card-icon blue">👥</div>
                        </div>
                        
                        <div style={{ overflowX: "auto" }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Correo</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="admin-user-name">{user.name}</div>
                                            </td>
                                            <td>
                                                <div className="admin-user-email">{user.email}</div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: "4px 12px",
                                                    borderRadius: "20px",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    backgroundColor: user.active ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                                    color: user.active ? "#10b981" : "#ef4444"
                                                }}>
                                                    {user.active ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className="admin-btn admin-btn-danger"
                                                    onClick={() => toggleUserActive(user.id)}
                                                >
                                                    {user.active ? "Desactivar" : "Activar"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Card 2: Módulo de IA */}
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2 className="admin-card-title">Módulo de IA (J48)</h2>
                            <div className="admin-card-icon teal">🤖</div>
                        </div>
                        
                        <div className="admin-ai-status">
                            <div className="admin-ai-dot"></div>
                            <div className="admin-ai-text">
                                <strong>Estado:</strong> Modelo activo y funcionando
                            </div>
                        </div>
                        
                        <div style={{
                            padding: "16px",
                            background: "rgba(15, 23, 42, 0.6)",
                            borderRadius: "14px",
                            marginBottom: "20px"
                        }}>
                            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>
                                Último entrenamiento
                            </div>
                            <div style={{ fontSize: "15px", color: "#f8fafc", fontWeight: "600" }}>
                                Hoy, 10:30 AM
                            </div>
                        </div>
                        
                        <button 
                            className="admin-btn admin-btn-primary"
                            onClick={retrainModel}
                            disabled={modelTraining}
                        >
                            {modelTraining ? "Reentrenando..." : "Reentrenar algoritmo predictivo"}
                        </button>
                    </div>

                    {/* Card 3: Analítica */}
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2 className="admin-card-title">Analítica de la Plataforma</h2>
                            <div className="admin-card-icon orange">📊</div>
                        </div>
                        
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "40px 0" }}>
                            <div style={{ color: "#64748b" }}>Cargando métricas...</div>
                        </div>
                        ) : (
                            <div className="admin-metrics-grid">
                                <div className="admin-metric-card">
                                    <div className="admin-metric-label">Usuarios Totales</div>
                                    <div className="admin-metric-value">{metrics?.usuariosTotales}</div>
                                </div>
                                <div className="admin-metric-card">
                                    <div className="admin-metric-label">Modelos Entrenados</div>
                                    <div className="admin-metric-value">{metrics?.modelosEntrenados}</div>
                                </div>
                                <div className="admin-metric-card">
                                    <div className="admin-metric-label">Logs de Errores</div>
                                    <div className="admin-metric-value">{metrics?.logsErrores}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: "32px" }}>
                    <Link to="/home" style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#64748b",
                        fontSize: "14px",
                        textDecoration: "none",
                        transition: "color 0.3s ease"
                    }}
                    onMouseOver={(e) => e.target.style.color = "#94a3b8"}
                    onMouseOut={(e) => e.target.style.color = "#64748b"}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Volver al inicio
                    </Link>
                </div>
            </div>

            <Toaster />
        </div>
    );
};

export default AdminDashboard;
