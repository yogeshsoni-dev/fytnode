import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Spinner from '../shared/Spinner';

export default function AppLayout() {
  const { state } = useApp();

  if (state.authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <Spinner size={40} />
      </div>
    );
  }

  if (!state.currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
