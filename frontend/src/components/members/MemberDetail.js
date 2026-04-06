import { Mail, Phone, MapPin, Calendar, User, CreditCard, CalendarCheck, Clock } from 'lucide-react';

export default function MemberDetail({ member, state }) {
  const { subscriptions, subscriptionPlans, trainers, attendance } = state;
  const sub     = subscriptions.find(s => s.memberId === member.id);
  const plan    = sub ? subscriptionPlans.find(p => p.id === sub.planId) : null;
  const trainer = trainers.find(t => t.id === member.trainerId);
  const visits  = attendance.filter(a => a.memberId === member.id);

  const AVATAR_COLORS = {
    admin: 'linear-gradient(135deg,#e11d48,#9f1239)',
    active: 'linear-gradient(135deg,#22c55e,#15803d)',
    expired: 'linear-gradient(135deg,#ef4444,#b91c1c)',
    default: 'linear-gradient(135deg,#e11d48,#9f1239)',
  };

  const infoRows = [
    { icon: Mail,     label: 'Email',    value: member.email },
    { icon: Phone,    label: 'Phone',    value: member.phone },
    { icon: MapPin,   label: 'Address',  value: member.address || '—' },
    { icon: User,     label: 'Age',      value: member.age ? `${member.age} years` : '—' },
    { icon: Calendar, label: 'Joined',   value: member.joinDate },
    { icon: User,     label: 'Trainer',  value: trainer?.name || 'Unassigned' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Profile header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 18,
        padding: '18px 20px',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-soft)',
        borderLeft: `3px solid ${plan?.color || 'var(--red)'}`,
      }}>
        <div className="avatar" style={{ width: 56, height: 56, fontSize: 20, fontWeight: 800, background: AVATAR_COLORS[member.status] || AVATAR_COLORS.default }}>
          {member.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 5 }}>{member.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`badge badge-${member.status}`}>{member.status}</span>
            {plan && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 4, background: `${plan.color}20`, color: plan.color }}>
                {plan.name} Plan
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Total Visits</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--red)', letterSpacing: '-1px' }}>{visits.length}</div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid-2">
        {infoRows.map(({ icon: Icon, label, value }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '11px 14px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
          }}>
            <Icon size={14} color="var(--red)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription row */}
      {sub && (
        <div>
          <div className="section-title"><CreditCard size={12} color="var(--red)" /> Subscription Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { label: 'Start Date',  value: sub.startDate },
              { label: 'End Date',    value: sub.endDate },
              { label: 'Amount Paid', value: `$${sub.amountPaid}` },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: '14px', textAlign: 'center',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance history */}
      <div>
        <div className="section-title"><CalendarCheck size={12} color="var(--red)" /> Recent Attendance</div>
        {visits.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No attendance records yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
            {visits.slice().reverse().map(a => {
              let dur = '—';
              if (a.checkOut) {
                const [ih, im] = a.checkIn.split(':').map(Number);
                const [oh, om] = a.checkOut.split(':').map(Number);
                const mins = (oh * 60 + om) - (ih * 60 + im);
                dur = `${Math.floor(mins / 60)}h ${mins % 60}m`;
              }
              return (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 13px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: 12,
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{a.date}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: 'var(--success)' }}>{a.checkIn}</span>
                    <span style={{ color: 'var(--text-faint)' }}>→</span>
                    <span style={{ color: a.checkOut ? 'var(--danger)' : 'var(--warning)' }}>{a.checkOut || 'Active'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                    <Clock size={11} /> {dur}
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
