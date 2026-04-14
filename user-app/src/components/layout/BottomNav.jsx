import { Bot, CalendarCheck, Dumbbell, Utensils } from 'lucide-react';

const TABS = [
  { id: 'attendance', label: 'Attendance', Icon: CalendarCheck },
  { id: 'calories',   label: 'Calories',   Icon: Utensils      },
  { id: 'exercise',   label: 'Exercise',   Icon: Dumbbell      },
  { id: 'chat',       label: 'AI Coach',   Icon: Bot           },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg safe-bottom">
      <div className="max-w-lg mx-auto flex">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
                isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon
                className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`}
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <span
                className={`text-[10px] font-semibold tracking-wide ${
                  isActive ? 'text-indigo-600' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
