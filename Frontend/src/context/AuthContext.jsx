import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMyUser, getUserDataFromToken } from '../api/auth';
import { getUsuariosRol } from '../api/adminService';

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;
  const id = user.id ?? user.id_usuario;
  return {
    ...user,
    id,
    id_usuario: user.id_usuario ?? Number(id),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => normalizeUser(getUserDataFromToken()));
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    const partialUser = normalizeUser(getUserDataFromToken());
    if (!partialUser?.id) {
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setUser(partialUser);

    try {
      const fullUser = normalizeUser(await getMyUser());
      setUser(fullUser);

      try {
        await getUsuariosRol();
        setIsAdmin(true);
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          setIsAdmin(false);
        } else {
          throw error;
        }
      }
    } catch (error) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setUser(null);
      setIsAdmin(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth().catch((error) => {
      console.error('Error rehidratando auth:', error);
    });
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
    setIsAdmin(false);
    window.location.reload();
  };

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      loading,
      refreshAuth,
      logout,
    }),
    [user, isAdmin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
