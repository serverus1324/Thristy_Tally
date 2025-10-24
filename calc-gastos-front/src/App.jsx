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
                    <Route path="/editar-datos" element={<ViewNecesidadPresupuesto />} /> {/* Usa el componente unificado */}
                </Routes>
            </div>
        </>
    );
}

export default App;