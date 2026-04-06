import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const { state } = useApp();

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
