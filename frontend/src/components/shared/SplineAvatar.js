import { Box } from 'lucide-react';

const SCENE_URL = process.env.REACT_APP_MEMBER_AVATAR_URL || '';

export default function SplineAvatar({
  title = 'Member Avatar',
  height = 260,
  rounded = 18,
}) {
  if (!SCENE_URL) {
    return (
      <div
        style={{
          height,
          borderRadius: rounded,
          border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, rgba(225,29,72,0.08), rgba(59,130,246,0.1))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          textAlign: 'center',
          padding: 18,
        }}
      >
        <Box size={28} color="var(--red)" />
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>3D Avatar Ready</div>
        <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-muted)', maxWidth: 260 }}>
          Add `REACT_APP_MEMBER_AVATAR_URL` in the frontend `.env` with your Spline public scene URL.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height,
        borderRadius: rounded,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,250,252,1))',
      }}
    >
      <iframe
        title={title}
        src={SCENE_URL}
        loading="lazy"
        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
        allow="fullscreen"
      />
    </div>
  );
}
