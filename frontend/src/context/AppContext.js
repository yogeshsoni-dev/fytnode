import { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { authApi } from '../api/auth.api';
import { notificationsApi } from '../api/notifications.api';

const AppContext = createContext();

const initialState = {
  currentUser: null,
  authLoading: true,
  unreadCount: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload, authLoading: false };
    case 'AUTH_DONE':
      return { ...state, authLoading: false };
    case 'LOGOUT':
      return { ...state, currentUser: null, unreadCount: 0, authLoading: false };
    case 'SET_UNREAD':
      return { ...state, unreadCount: action.payload };
    default:
      return state;
  }
}

function clearAuthStorage() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentUser');
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshUnread = useCallback(async () => {
    if (!state.currentUser) return;
    try {
      const res = await notificationsApi.getAll({ limit: 1 });
      dispatch({ type: 'SET_UNREAD', payload: res.unreadCount });
    } catch {
      // Ignore background unread refresh failures.
    }
  }, [state.currentUser]);

  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        dispatch({ type: 'AUTH_DONE' });
        return;
      }

      try {
        const user = await authApi.me();
        dispatch({ type: 'SET_USER', payload: user });
      } catch {
        clearAuthStorage();
        dispatch({ type: 'AUTH_DONE' });
      }
    };

    restore();
  }, []);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    try {
      const user = await authApi.me();
      dispatch({ type: 'SET_USER', payload: user });
      return { ...data, user };
    } catch (error) {
      clearAuthStorage();
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  }, []);

  const signup = useCallback(async (payload) => {
    const data = await authApi.signup(payload);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    try {
      const user = await authApi.me();
      dispatch({ type: 'SET_USER', payload: user });
      return { ...data, user };
    } catch (error) {
      clearAuthStorage();
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await authApi.logout(refreshToken);
    } catch {
      // Ignore logout network failures and clear local session anyway.
    }

    clearAuthStorage();
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AppContext.Provider
      value={{ state, login, signup, logout, unreadCount: state.unreadCount, refreshUnread }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
