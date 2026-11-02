import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import ViewDashboard from './pages/dashboard/ViewDashboard';
import ViewNecesidadPresupuesto from './pages/necesidad-presupuesto/ViewNecesidadPresupuesto';
import ViewHome from './pages/home/ViewHome';
import ViewInicio from './pages/inicio/ViewInicio';
import ViewLogin from './pages/login/ViewLogin';
import ViewSignup from './pages/signup/ViewSignup';
import EditarPresupuesto from './pages/presupuesto/EditarPresupuesto';
import ViewEditarDatos from './pages/usuario/ViewEditarDatos';
import CompararPresupuestos from './pages/comparar/CompararPresupuestos';
import Prediction from './pages/Prediction/Prediction';
import ForgotPassword from './pages/recover-password/ForgotPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';
import AdminConfig from './pages/admin/AdminConfig';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <>
            <div className="App">
                <Routes>
                    {/* ---------- Públicas ---------- */}
                    <Route path="/" element={<ViewInicio />} />
                    <Route path="/login" element={<ViewLogin />} />
                    <Route path="/signup" element={<ViewSignup />} />
                    <Route path="/recover-password" element={<ForgotPassword />} />
                    
                    {/* ---------- Rutas de ESTUDIANTE ---------- */}
                    <Route path="/home" element={<ProtectedRoute><ViewHome /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><ViewDashboard /></ProtectedRoute>} />
                    <Route path="/necesidad-presupuesto" element={<ProtectedRoute><ViewNecesidadPresupuesto /></ProtectedRoute>} />
                    <Route path="/presupuesto/:id/editar" element={<ProtectedRoute><EditarPresupuesto /></ProtectedRoute>} />
                    <Route path="/crear-gasto" element={<ProtectedRoute><ViewNecesidadPresupuesto /></ProtectedRoute>} />
                    <Route path="/editar-datos" element={<ProtectedRoute><ViewEditarDatos /></ProtectedRoute>} />
                    <Route path="/comparar-presupuestos" element={<ProtectedRoute><CompararPresupuestos /></ProtectedRoute>} />
                    <Route path="/prediccion-necesidades" element={<ProtectedRoute><Prediction /></ProtectedRoute>} />
                    <Route path="/prediction" element={<ProtectedRoute><Prediction /></ProtectedRoute>} />

                    {/* ---------- Solo ADMIN ---------- */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<AdminDashboard />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="usuarios" element={<AdminUsers />} />
                        <Route path="reportes" element={<AdminReports />} />
                        <Route path="perfil" element={<AdminConfig />} />
                        <Route path="configuracion" element={<AdminConfig />} />
                    </Route>
                </Routes>
            </div>
            <Toaster position="top-center" reverseOrder={false} />
            <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss={false} />
        </>
    );
}

export default App;