import { AlertCircle, ArrowRight } from 'lucide-react';
import type { Relationship, Issue, Table } from '../../types/schema';

export default function RelationshipsTab({ relationships, issues, tables }: {
  relationships: Relationship[]; issues: Issue[]; tables: Table[];
}) {
  const fkIssues = issues.filter(i => i.type === 'missing_foreign_key' || i.type === 'circular_dependency');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
        {[
          { label: 'Tables',          value: tables.length,        color: '#7c6af7' },
          { label: 'Relationships',   value: relationships.length, color: '#a78bfa' },
          { label: 'FK Issues',       value: fkIssues.length,      color: fkIssues.length > 0 ? '#f43f5e' : '#10b981' },
          { label: 'Avg FK / Table',  value: tables.length > 0 ? (relationships.length / tables.length).toFixed(1) : '0', color: '#06b6d4' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, letterSpacing: '-0.04em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Relationships list */}
      {relationships.length > 0 && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
            Defined Foreign Keys
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {relationships.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', background: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)', borderRadius: 7, fontFamily: 'monospace', fontSize: 12,
              }}>
                <code style={{ color: '#7c6af7' }}>{r.from}</code>
                <span style={{ color: 'var(--text-muted)' }}>({r.fromColumn})</span>
                <ArrowRight size={12} color="var(--text-muted)" />
                <code style={{ color: '#10b981' }}>{r.to}</code>
                <span style={{ color: 'var(--text-muted)' }}>({r.toColumn})</span>
                <span className="badge badge-gray" style={{ marginLeft: 'auto' }}>FK</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table schema */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
          Table Schema
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tables.map(t => (
            <div key={t.name} style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ background: 'var(--surface-1-alt)', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <code style={{ fontSize: 12, fontWeight: 700, color: '#7c6af7', fontFamily: 'monospace' }}>{t.name}</code>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="badge badge-gray">{t.columns.length} cols</span>
                  {t.primaryKeys.length > 0 && <span className="badge badge-yellow">PK</span>}
                  {t.foreignKeys.length > 0 && <span className="badge badge-purple">{t.foreignKeys.length} FK</span>}
                </div>
              </div>
              {/* Columns */}
              {t.columns.map((c, ci) => (
                <div key={ci} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 12px', fontFamily: 'monospace', fontSize: 12,
                  borderTop: '1px solid var(--border-subtle)',
                  background: ci % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-1)',
                }}>
                  <span style={{ width: 16, textAlign: 'center', fontSize: 11 }}>
                    {c.isPrimary ? '🔑' : c.references ? '🔗' : ''}
                  </span>
                  <code style={{ flex: 1, color: c.isPrimary ? '#fde68a' : 'var(--text-primary)', fontWeight: c.isPrimary ? 600 : 400 }}>{c.name}</code>
                  <code style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{c.type}</code>
                  {!c.nullable && <span style={{ fontSize: 10, color: '#f43f5e', opacity: 0.7 }}>NOT NULL</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FK Issues */}
      {fkIssues.length > 0 && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 10, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
            <AlertCircle size={13} color="#f43f5e" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Relationship Issues</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fkIssues.map((iss, i) => (
              <div key={i} style={{ padding: '10px 12px', background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: 7 }}>
                <p style={{ fontSize: 12, color: '#fb7185' }}>{iss.message}</p>
                {iss.recommendation && (
                  <code style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace', display: 'block', marginTop: 4, lineHeight: 1.5 }}>
                    {iss.recommendation}
                  </code>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
