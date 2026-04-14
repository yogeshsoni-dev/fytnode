import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import './styles/globals.css';

import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import Gyms from './components/gyms/Gyms';
import Shop from './components/shop/Shop';
import Members from './components/members/Members';
import Attendance from './components/attendance/Attendance';
import Subscriptions from './components/subscriptions/Subscriptions';
import Trainers from './components/trainers/Trainers';
import Notifications from './components/notifications/Notifications';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="gyms" element={<Gyms />} />
            <Route path="shop" element={<Shop />} />
            <Route path="members" element={<Members />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="trainers" element={<Trainers />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
