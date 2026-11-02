import { createContext, useContext, useCallback, useMemo, useState } from "react";

const AuthContext = createContext(null);

const STORAGE = {
  token: "authToken",
  idPerfil: "idPerfil",
  user: "thrifty_user",
};

const leerUsuario = () => {
  try {
    const raw = localStorage.getItem(STORAGE.user);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // El estado se hidrata desde localStorage para sobrevivir recargas (F5).
  const [user, setUser] = useState(leerUsuario);

  const login = useCallback((data) => {
    const usuarioSeguro = {
      idUsuario: data?.idUsuario ?? null,
      idPerfil: data?.idPerfil ?? null,
      username: data?.username ?? "",
      nombre: data?.nombre ?? "",
      email: data?.email ?? "",
      roles: Array.isArray(data?.roles) ? data.roles : [],
    };

    if (data?.token) localStorage.setItem(STORAGE.token, data.token);
    if (usuarioSeguro.idPerfil) {
      localStorage.setItem(STORAGE.idPerfil, String(usuarioSeguro.idPerfil));
    }
    localStorage.setItem(STORAGE.user, JSON.stringify(usuarioSeguro));
    setUser(usuarioSeguro);
    return usuarioSeguro;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE.token);
    localStorage.removeItem(STORAGE.idPerfil);
    localStorage.removeItem(STORAGE.user);
    setUser(null);
  }, []);

  const value = useMemo(() => {
    const roles = user?.roles ?? [];
    return {
      user,
      roles,
      isAuthenticated: !!localStorage.getItem(STORAGE.token) && !!user,
      isAdmin: roles.includes("ROLE_ADMIN"),
      hasRole: (role) => roles.includes(role),
      login,
      logout,
    };
  }, [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};

export default AuthContext;
