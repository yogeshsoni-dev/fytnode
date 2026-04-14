import { Box } from 'lucide-react';

const SCENE_URL = import.meta.env.VITE_MEMBER_AVATAR_URL || '';

export default function SplineAvatar({
  title = 'Member Avatar',
  heightClass = 'h-[420px]',
}) {
  if (!SCENE_URL) {
    return (
      <div className={`${heightClass} rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col items-center justify-center text-center px-6`}>
        <Box className="w-8 h-8 text-indigo-500 mb-3" />
        <div className="text-sm font-semibold text-slate-800">3D Avatar Ready</div>
        <div className="text-xs text-slate-500 mt-2 leading-relaxed max-w-xs">
          Add <code>VITE_MEMBER_AVATAR_URL</code> in <code>user-app/.env</code> with your Spline public scene URL.
        </div>
      </div>
    );
  }

  return (
    <div className={`${heightClass} rounded-3xl overflow-hidden border border-indigo-100 bg-white shadow-sm`}>
      <iframe
        title={title}
        src={SCENE_URL}
        loading="lazy"
        className="w-full h-full border-0 block"
        allow="fullscreen"
      />
    </div>
  );
}
