import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/client.js';

const UserContext = createContext({ user: null, loading: true, refresh: () => {} });

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    // Skip the network call entirely with no token - avoids a guaranteed
    // 401 on every public page (Homepage, Login, Signup) before anyone
    // has signed in, which would otherwise trip the 401 interceptor.
    if (!localStorage.getItem('token')) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await authApi.me();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refresh: load }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
