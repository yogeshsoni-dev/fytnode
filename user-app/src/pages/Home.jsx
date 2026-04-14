import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/layout/BottomNav';
import AttendanceScreen from '../screens/AttendanceScreen';
import CalorieScreen from '../screens/CalorieScreen';
import ExerciseScreen from '../screens/ExerciseScreen';
import ChatScreen from '../screens/ChatScreen';

const SCREEN_TITLES = {
  attendance: 'Attendance',
  calories:   'Calorie Tracker',
  exercise:   'Exercise Log',
  chat:       'AI Health Coach',
};

const SCREEN_SUBTITLES = {
  attendance: 'Mark your gym sessions',
  calories:   'Track what you eat',
  exercise:   'Log your workouts',
  chat:       'Personalised fitness advice',
};

export default function Home() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('attendance');

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Welcome back
            </p>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{firstName}</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors py-2 px-3 rounded-xl hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        {/* Screen title */}
        <div className="max-w-lg mx-auto px-4 pb-3">
          <h2 className="text-xl font-bold text-gray-900">{SCREEN_TITLES[activeTab]}</h2>
          <p className="text-sm text-gray-500">{SCREEN_SUBTITLES[activeTab]}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24">
        {activeTab === 'attendance' && <AttendanceScreen />}
        {activeTab === 'calories'   && <CalorieScreen />}
        {activeTab === 'exercise'   && <ExerciseScreen />}
        {activeTab === 'chat'       && <ChatScreen />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
