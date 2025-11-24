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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <>
            <div className="App">
                <Routes>
                    <Route path="/" element={<ViewInicio />} />
                    <Route path="/login" element={<ViewLogin />} />
                    <Route path="/signup" element={<ViewSignup />} />
                    <Route path="/home" element={<ViewHome />} />
                    <Route path="/dashboard" element={<ViewDashboard />} />
                    <Route path="/necesidad-presupuesto" element={<ViewNecesidadPresupuesto />} /> 
                    <Route path="/presupuesto/:id/editar" element={<EditarPresupuesto />} />
                <Route path="/crear-gasto" element={<ViewNecesidadPresupuesto />} />
                <Route path="/editar-datos" element={<ViewEditarDatos />} />
                <Route path="/comparar-presupuestos" element={<CompararPresupuestos />} />
                <Route path="/prediccion-necesidades" element={<Prediction />} />
                <Route path="/prediction" element={<Prediction />} />
                </Routes>
            </div>
            <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss={false} />
        </>
    );
}

export default App;