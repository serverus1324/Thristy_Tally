import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Protege rutas según autenticación y (opcionalmente) roles reales.
 * - Sin sesión válida -> redirige a /login conservando el origen.
 * - Con sesión pero sin el rol requerido -> redirige a /home.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si no se especifican roles, solo pedimos estar autenticado.
  // Pero si el usuario es ADMIN, lo mandamos a su panel si intenta entrar a una ruta de usuario.
  if (!allowedRoles || allowedRoles.length === 0) {
    // Si la ruta NO empieza por /admin y el usuario es ADMIN, redirigir
    if (isAdmin && !location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return children;
  }

  const roles = user?.roles ?? [];
  const autorizado = allowedRoles.some((role) => roles.includes(role));

  if (!autorizado) {
    // Si un admin intenta entrar a ruta de usuario
    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // Si un usuario normal intenta entrar a una ruta para la que no tiene permiso
    // (Ej: intentar entrar a /admin)
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
