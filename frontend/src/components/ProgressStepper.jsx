import { Check } from 'lucide-react';

// steps: [{ label: string, status: 'done' | 'active' | 'pending' }]
export default function ProgressStepper({ steps }) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center flex-1 last:flex-initial">
          <div className="flex flex-col items-center gap-2">
            <div
              className={
                step.status === 'done'
                  ? 'w-9 h-9 rounded-full bg-accent-500 flex items-center justify-center text-white'
                  : step.status === 'active'
                  ? 'w-9 h-9 rounded-full bg-base border-2 border-accent-500 flex items-center justify-center text-accent-500 shadow-[0_0_0_6px_rgba(255,106,26,0.15)]'
                  : 'w-9 h-9 rounded-full bg-surface2 border border-border flex items-center justify-center text-muted'
              }
            >
              {step.status === 'done' ? (
                <Check size={16} />
              ) : step.status === 'active' ? (
                <span className="w-2.5 h-2.5 rounded-full bg-accent-500" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-muted" />
              )}
            </div>
            <div className="text-center">
              <p
                className={
                  step.status === 'pending'
                    ? 'text-xs text-muted'
                    : step.status === 'active'
                    ? 'text-xs text-accent-500 font-medium'
                    : 'text-xs text-success font-medium'
                }
              >
                {step.label}
              </p>
              <p className="text-[11px] text-muted">{step.sub}</p>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-[2px] flex-1 mx-2 -mt-6 ${
                step.status === 'done' ? 'bg-accent-500' : 'bg-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
