import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { authApi } from '../api/auth.api';
import { healthProfileApi } from '../api/healthProfile.api';

// Silently ensure user exists in Django AI backend
async function ensureDjangoUser(user) {
  try {
    await healthProfileApi.createOrUpdate({ name: user.name || user.email });
  } catch {
    // Non-critical — don't block login
  }
}

const AuthContext = createContext();

const initialState = {
  user: null,
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { user: action.payload, loading: false };
    case 'AUTH_DONE':
      return { ...state, loading: false };
    case 'LOGOUT':
      return { user: null, loading: false };
    default:
      return state;
  }
}

function clearStorage() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentUser');
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // On mount: restore session if token is present
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        dispatch({ type: 'AUTH_DONE' });
        return;
      }
      try {
        const user = await authApi.me();
        localStorage.setItem('currentUser', JSON.stringify(user));
        dispatch({ type: 'SET_USER', payload: user });
        ensureDjangoUser(user);
      } catch {
        clearStorage();
        dispatch({ type: 'AUTH_DONE' });
      }
    };
    restore();
  }, []);

  const login = useCallback(async (email, password) => {
    // The login response already contains the full user object — no need for a
    // separate /me call that could fail with CORS or network errors.
    const { user, accessToken, refreshToken } = await authApi.login(email, password);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(user));
    dispatch({ type: 'SET_USER', payload: user });
    ensureDjangoUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await authApi.logout(refreshToken);
    } catch {
      // Clear local session even if network call fails
    }
    clearStorage();
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider value={{ user: state.user, loading: state.loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
