import { createContext, useContext, useReducer } from 'react';
import {
  USERS, MEMBERS, TRAINERS, SUBSCRIPTION_PLANS, SUBSCRIPTIONS, ATTENDANCE, NOTIFICATIONS
} from '../data/mockData';

const AppContext = createContext();

const initialState = {
  currentUser: null,
  members: MEMBERS,
  trainers: TRAINERS,
  subscriptionPlans: SUBSCRIPTION_PLANS,
  subscriptions: SUBSCRIPTIONS,
  attendance: ATTENDANCE,
  notifications: NOTIFICATIONS,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload };
    case 'LOGOUT':
      return { ...state, currentUser: null };

    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.payload] };
    case 'UPDATE_MEMBER':
      return { ...state, members: state.members.map(m => m.id === action.payload.id ? action.payload : m) };
    case 'DELETE_MEMBER':
      return { ...state, members: state.members.filter(m => m.id !== action.payload) };

    case 'ADD_TRAINER':
      return { ...state, trainers: [...state.trainers, action.payload] };
    case 'UPDATE_TRAINER':
      return { ...state, trainers: state.trainers.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TRAINER':
      return { ...state, trainers: state.trainers.filter(t => t.id !== action.payload) };

    case 'ADD_SUBSCRIPTION':
      return { ...state, subscriptions: [...state.subscriptions, action.payload] };
    case 'UPDATE_SUBSCRIPTION':
      return { ...state, subscriptions: state.subscriptions.map(s => s.id === action.payload.id ? action.payload : s) };

    case 'CHECK_IN':
      return { ...state, attendance: [...state.attendance, action.payload] };

    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = (email, password) => {
    const user = USERS.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      dispatch({ type: 'LOGIN', payload: safeUser });
      return { success: true, user: safeUser };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{ state, dispatch, login, logout, unreadCount }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
