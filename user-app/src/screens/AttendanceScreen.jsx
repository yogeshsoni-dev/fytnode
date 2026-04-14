import { useEffect, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { attendanceApi } from '../api/attendance.api';

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function AttendanceScreen() {
  const { user } = useAuth();
  const memberId = user?.member?.id;

  const [todayRecord, setTodayRecord] = useState(null); // today's attendance record or null
  const [history, setHistory]         = useState([]);
  const [streak, setStreak]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  const load = async () => {
    if (!memberId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const [histRes, streakRes] = await Promise.all([
        attendanceApi.getMemberHistory(memberId, { limit: 10 }),
        attendanceApi.getStreak(memberId),
      ]);

      const today = todayISO();
      const records = histRes.data ?? [];
      const todayRec = records.find((r) => {
        const d = new Date(r.date).toISOString().split('T')[0];
        return d === today;
      });

      setTodayRecord(todayRec ?? null);
      setHistory(records);
      setStreak(streakRes?.streak ?? 0);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load attendance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [memberId]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const record = await attendanceApi.checkIn();
      setTodayRecord(record);
      setHistory((prev) => [record, ...prev.filter((r) => r.id !== record.id)]);
      setSuccess('Checked in successfully!');
    } catch (e) {
      setError(e?.response?.data?.message || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord?.id) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const updated = await attendanceApi.checkOut(todayRecord.id);
      setTodayRecord(updated);
      setHistory((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSuccess('Checked out successfully!');
    } catch (e) {
      setError(e?.response?.data?.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!memberId) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-center px-4">
        <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
        <p className="text-gray-600 font-medium">No member profile linked to your account.</p>
        <p className="text-sm text-gray-400 mt-1">Contact your gym admin to set up your membership.</p>
      </div>
    );
  }

  const isCheckedIn  = !!todayRecord?.checkIn && !todayRecord?.checkOut;
  const isCompleted  = !!todayRecord?.checkIn && !!todayRecord?.checkOut;

  return (
    <div className="space-y-4 pb-4">
      {/* Today's Status Card */}
      <div
        className={`rounded-2xl p-5 text-white shadow-md ${
          isCompleted
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            : isCheckedIn
            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600'
            : 'bg-gradient-to-br from-gray-500 to-gray-600'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium opacity-80">Today</span>
          <CalendarCheck className="w-5 h-5 opacity-80" />
        </div>
        <p className="text-2xl font-bold mb-1">
          {isCompleted
            ? 'Session Complete'
            : isCheckedIn
            ? 'Currently In Gym'
            : 'Not Checked In'}
        </p>
        {todayRecord?.checkIn && (
          <p className="text-sm opacity-80">
            In: {formatTime(todayRecord.checkIn)}
            {todayRecord.checkOut && `  •  Out: ${formatTime(todayRecord.checkOut)}`}
          </p>
        )}
      </div>

      {/* Streak */}
      {streak !== null && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Flame className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <span className="font-bold text-amber-700">{streak} day streak</span>
            <span className="text-sm text-amber-600 ml-1">— keep it up!</span>
          </div>
        </div>
      )}

      {/* Feedback */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
          {success}
        </div>
      )}

      {/* Action Buttons */}
      {!loading && (
        <div className="flex gap-3">
          {!isCheckedIn && !isCompleted && (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3.5 rounded-2xl transition-colors disabled:opacity-60"
            >
              <LogIn className="w-5 h-5" />
              {actionLoading ? 'Checking in…' : 'Check In'}
            </button>
          )}
          {isCheckedIn && (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-3.5 rounded-2xl transition-colors disabled:opacity-60"
            >
              <LogOut className="w-5 h-5" />
              {actionLoading ? 'Checking out…' : 'Check Out'}
            </button>
          )}
          {isCompleted && (
            <div className="flex-1 flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 font-semibold py-3.5 rounded-2xl">
              <CheckCircle2 className="w-5 h-5" />
              Attendance Marked
            </div>
          )}
        </div>
      )}

      {/* History */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Recent History
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No attendance records yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((rec) => {
              const isToday = new Date(rec.date).toISOString().split('T')[0] === todayISO();
              return (
                <div
                  key={rec.id}
                  className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        rec.checkOut
                          ? 'bg-emerald-500'
                          : rec.checkIn
                          ? 'bg-indigo-500'
                          : 'bg-gray-300'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {isToday ? 'Today' : formatDate(rec.date)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {rec.checkIn ? `In ${formatTime(rec.checkIn)}` : 'No check-in'}
                        {rec.checkOut ? ` · Out ${formatTime(rec.checkOut)}` : ''}
                      </p>
                    </div>
                  </div>
                  <div>
                    {rec.checkOut ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : rec.checkIn ? (
                      <Clock className="w-4 h-4 text-indigo-400" />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
