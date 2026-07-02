import { CheckCircle2, Terminal, FileText, BarChart3, Code2, Sparkles } from 'lucide-react';

export type ProcessStep = 'input' | 'parsing' | 'analyzing' | 'scoring' | 'generating' | 'done';

interface StepDef {
  key: ProcessStep;
  icon: typeof Terminal;
  label: string;
}

const STEPS: StepDef[] = [
  { key: 'input', icon: Terminal, label: 'SQL Input' },
  { key: 'parsing', icon: FileText, label: 'Parse Schema' },
  { key: 'analyzing', icon: BarChart3, label: 'Analyze' },
  { key: 'scoring', icon: Sparkles, label: 'Score' },
  { key: 'generating', icon: Code2, label: 'Generate Output' },
  { key: 'done', icon: CheckCircle2, label: 'Complete' },
];

interface Props {
  currentStep: ProcessStep;
  compact?: boolean;
}

export default function ProcessFlow({ currentStep, compact }: Props) {
  const activeIdx = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: compact ? 4 : 0,
      width: '100%',
      ...(compact ? {} : { padding: '16px 0' }),
    }}>
      {STEPS.map((step, i) => {
        const isPast = i < activeIdx;
        const isCurrent = i === activeIdx;
        const isFuture = i > activeIdx;
        const Icon = step.icon;

        return (
          <div key={step.key} style={{
            display: 'flex', alignItems: 'center', flex: compact ? 0 : 1,
            minWidth: 0,
          }}>
            <div style={{
              display: 'flex', flexDirection: compact ? 'row' : 'column',
              alignItems: 'center', gap: compact ? 6 : 4,
              opacity: isFuture ? 0.35 : 1,
              transition: 'opacity 0.3s',
            }}>
              <div style={{
                width: compact ? 24 : 32, height: compact ? 24 : 32,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isPast ? '#10b981'
                  : isCurrent ? '#7c6af7'
                  : 'var(--surface-3)',
                border: `1px solid ${
                  isPast ? '#10b981'
                    : isCurrent ? '#7c6af7'
                    : 'var(--border-strong)'
                }`,
                transition: 'all 0.3s',
                animation: isCurrent ? 'pulse-glow 1.5s ease-in-out infinite' : 'none',
                boxShadow: isCurrent ? '0 0 12px rgba(124,106,247,0.4)' : 'none',
              }}>
                <Icon size={compact ? 12 : 14} color={isPast || isCurrent ? '#fff' : 'var(--text-muted)'} />
              </div>
              {!compact && (
                <span style={{
                  fontSize: 10, fontWeight: 500, color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap', textAlign: 'center',
                  transition: 'color 0.3s',
                }}>
                  {step.label}
                </span>
              )}
            </div>

            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 1,
                minWidth: compact ? 8 : 12,
                background: isPast ? '#10b981' : 'var(--border)',
                transition: 'background 0.3s',
                marginBottom: compact ? 0 : 20,
              }} />
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(124,106,247,0.3); }
          50% { box-shadow: 0 0 18px rgba(124,106,247,0.6); }
        }
      `}</style>
    </div>
  );
}
