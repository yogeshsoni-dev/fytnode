import { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Loader2,
  Plus,
} from 'lucide-react';
import { exerciseApi } from '../api/exercise.api';

const COMMON_EXERCISES = [
  'Running', 'Walking', 'Cycling', 'Swimming', 'Jump Rope',
  'Push-ups', 'Pull-ups', 'Squats', 'Plank', 'Burpees',
  'Weight Training', 'Yoga', 'HIIT', 'Rowing', 'Elliptical',
];

function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString([], {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ExerciseScreen() {
  const [name, setName]         = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes]       = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(null); // logged exercise object
  const [error, setError]           = useState('');

  const [history, setHistory]       = useState([]);
  const [histLoading, setHistLoading] = useState(true);

  const loadHistory = async () => {
    setHistLoading(true);
    try {
      const res = await exerciseApi.getHistory();
      // API returns { exercises: [...] } or just an array
      setHistory(Array.isArray(res) ? res : (res.exercises ?? res.results ?? []));
    } catch {
      // History is optional; silently fail
    } finally {
      setHistLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !duration) return;
    setSubmitting(true);
    setError('');
    setSuccess(null);
    try {
      const result = await exerciseApi.addExercise({
        exercise_name:    name.trim(),
        duration_minutes: parseInt(duration, 10),
        notes:            notes.trim() || undefined,
      });
      setSuccess(result);
      setName('');
      setDuration('');
      setNotes('');
      await loadHistory();
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.detail || 'Failed to log exercise.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectQuick = (exercise) => {
    setName(exercise);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Log Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-indigo-500" />
          Log Exercise
        </h3>

        {/* Quick pick chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {COMMON_EXERCISES.slice(0, 8).map((ex) => (
            <button
              key={ex}
              onClick={() => selectQuick(ex)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                name === ex
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {ex}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Exercise Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Running, Weight Training…"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="30"
              min="1"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. moderate pace, felt great…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>

          <p className="text-xs text-gray-400">
            AI will estimate calories burned based on the exercise and duration.
          </p>

          <button
            type="submit"
            disabled={submitting || !name.trim() || !duration}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {submitting ? 'Logging…' : 'Log Exercise'}
          </button>
        </form>
      </div>

      {/* Feedback */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-emerald-700 font-medium mb-1">
            <CheckCircle2 className="w-4 h-4" />
            Exercise logged!
          </div>
          {success.calories_burned != null && (
            <p className="text-sm text-emerald-600">
              <Flame className="w-3.5 h-3.5 inline mr-1" />
              Estimated {success.calories_burned} kcal burned
            </p>
          )}
        </div>
      )}

      {/* History */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Recent Exercise
        </h3>
        {histLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
            <Activity className="w-8 h-8" />
            <p className="text-sm">No exercises logged yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 10).map((ex, i) => (
              <div
                key={ex.id ?? i}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 capitalize">
                      {ex.exercise_name ?? ex.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDateTime(ex.created_at ?? ex.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {ex.duration_minutes != null && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {ex.duration_minutes} min
                    </p>
                  )}
                  {ex.calories_burned != null && (
                    <p className="text-sm font-semibold text-amber-600 flex items-center gap-1 justify-end">
                      <Flame className="w-3.5 h-3.5" />
                      {ex.calories_burned} kcal
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
