import React from "react";
import { Navigate } from "react-router-dom";

// Simulated auth hook - in a real app, this would get user data from context or state
const useAuth = () => {
    // For demo purposes, let's simulate a user with roles from localStorage or default
    const user = JSON.parse(localStorage.getItem("thrifty_user") || "null");
    
    // If no user in storage, return default user with USER role for testing
    return {
        user: user || {
            roles: ["ROLE_USER"] // Default role
        },
        isAuthenticated: !!user || true // For demo, let's allow access
    };
};

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    
    // Check if user has any of the allowed roles
    const hasPermission = allowedRoles.some(role => user.roles.includes(role));
    
    if (!hasPermission) {
        // Redirect to home if user doesn't have required roles
        return <Navigate to="/home" replace />;
    }
    
    // If user has permission, render the children
    return children;
};

export default ProtectedRoute;
