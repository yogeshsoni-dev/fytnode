import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Loader2,
  Save,
  User,
} from 'lucide-react';
import { healthProfileApi } from '../api/healthProfile.api';
import { useAuth } from '../context/AuthContext';

const FITNESS_GOALS = [
  { value: 'weight_loss',    label: 'Weight Loss' },
  { value: 'muscle_gain',    label: 'Muscle Gain' },
  { value: 'endurance',      label: 'Endurance' },
  { value: 'general_fitness', label: 'General Fitness' },
  { value: 'flexibility',    label: 'Flexibility' },
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary',    label: 'Sedentary (little/no exercise)' },
  { value: 'light',        label: 'Light (1–3 days/week)' },
  { value: 'moderate',     label: 'Moderate (3–5 days/week)' },
  { value: 'active',       label: 'Active (6–7 days/week)' },
  { value: 'very_active',  label: 'Very Active (intense, twice/day)' },
];

const GENDERS = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other' },
];

const FIELD = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white';
const LABEL = 'text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1';

function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD} appearance-none pr-10`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

export default function HealthProfileScreen() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name:           '',
    age:            '',
    gender:         '',
    height_cm:      '',
    weight_kg:      '',
    fitness_goal:   '',
    activity_level: '',
  });

  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState('');

  // Pre-fill name from auth user and try to load existing profile
  useEffect(() => {
    const load = async () => {
      setForm((f) => ({ ...f, name: user?.name || '' }));
      try {
        const profile = await healthProfileApi.getProfile();
        if (profile) {
          setForm({
            name:           profile.name           || user?.name || '',
            age:            profile.age            != null ? String(profile.age) : '',
            gender:         profile.gender         || '',
            height_cm:      profile.height_cm      != null ? String(profile.height_cm) : '',
            weight_kg:      profile.weight_kg      != null ? String(profile.weight_kg) : '',
            fitness_goal:   profile.fitness_goal   || '',
            activity_level: profile.activity_level || '',
          });
        }
      } catch {
        // Profile may not exist yet — that's fine
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const payload = {
        name:   form.name.trim(),
        ...(form.age            && { age: parseInt(form.age, 10) }),
        ...(form.gender         && { gender: form.gender }),
        ...(form.height_cm      && { height_cm: parseFloat(form.height_cm) }),
        ...(form.weight_kg      && { weight_kg: parseFloat(form.weight_kg) }),
        ...(form.fitness_goal   && { fitness_goal: form.fitness_goal }),
        ...(form.activity_level && { activity_level: form.activity_level }),
      };
      await healthProfileApi.createOrUpdate(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      const detail = e?.response?.data?.detail || e?.response?.data?.error;
      if (detail && typeof detail === 'object') {
        setError(Object.values(detail).flat().join(' '));
      } else {
        setError(detail || 'Failed to save profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" />
          Health Profile
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className={LABEL}>Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name')(e.target.value)}
              placeholder="Your name"
              required
              className={FIELD}
            />
          </div>

          {/* Age + Gender row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => set('age')(e.target.value)}
                placeholder="25"
                min="10"
                max="100"
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Gender</label>
              <Select
                value={form.gender}
                onChange={set('gender')}
                options={GENDERS}
                placeholder="Select"
              />
            </div>
          </div>

          {/* Height + Weight row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Height (cm)</label>
              <input
                type="number"
                value={form.height_cm}
                onChange={(e) => set('height_cm')(e.target.value)}
                placeholder="170"
                min="100"
                max="250"
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL}>Weight (kg)</label>
              <input
                type="number"
                value={form.weight_kg}
                onChange={(e) => set('weight_kg')(e.target.value)}
                placeholder="70"
                min="30"
                max="300"
                step="0.1"
                className={FIELD}
              />
            </div>
          </div>

          {/* Fitness Goal */}
          <div>
            <label className={LABEL}>Fitness Goal</label>
            <Select
              value={form.fitness_goal}
              onChange={set('fitness_goal')}
              options={FITNESS_GOALS}
              placeholder="Select your goal"
            />
          </div>

          {/* Activity Level */}
          <div>
            <label className={LABEL}>Activity Level</label>
            <Select
              value={form.activity_level}
              onChange={set('activity_level')}
              options={ACTIVITY_LEVELS}
              placeholder="Select activity level"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !form.name.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2 text-emerald-700 font-medium text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Profile saved! AI coach will now give you personalised advice.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Info card */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm text-indigo-700">
        <p className="font-semibold mb-1">Why fill this out?</p>
        <p className="text-indigo-600 leading-relaxed">
          Your health profile helps the AI coach personalise calorie targets, exercise recommendations, and nutrition advice specifically for you.
        </p>
      </div>
    </div>
  );
}
