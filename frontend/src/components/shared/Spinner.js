export default function Spinner({ size = 32, style = {} }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40, ...style,
    }}>
      <span style={{
        display: 'inline-block',
        width: size, height: size,
        border: '3px solid var(--border-mid)',
        borderTopColor: 'var(--red)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );
}
