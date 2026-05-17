import { Check } from 'lucide-react'
import type { WorkflowPhase } from '../domain/workflow'

const PHASE_ORDER: WorkflowPhase[] = [
  'Intake Active',
  'Document Review Active',
  'CPA Review Pending',
  'Filing Readiness Pending',
  'Approved',
]

const SHORT_LABELS: Record<WorkflowPhase, string> = {
  'Intake Active': 'Intake',
  'Document Review Active': 'Documents',
  'CPA Review Pending': 'CPA review',
  'Filing Readiness Pending': 'Filing prep',
  Approved: 'Approved',
}

interface WorkflowStepperProps {
  currentPhase: WorkflowPhase
}

export function WorkflowStepper({ currentPhase }: WorkflowStepperProps) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase)

  return (
    <nav
      aria-label="Workflow progress"
      className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ol className="flex min-w-max items-center gap-0 px-0.5">
        {PHASE_ORDER.map((phase, index) => {
          const isComplete = index < currentIndex
          const isCurrent = index === currentIndex
          const isUpcoming = index > currentIndex

          return (
            <li key={phase} className="flex items-center">
              <div
                className={`flex flex-col items-center gap-1.5 px-2 sm:px-3 ${
                  isCurrent ? 'min-w-[4.5rem]' : 'min-w-[3.5rem]'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors sm:h-9 sm:w-9 ${
                    isComplete
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                        ? 'bg-slate-900 text-white ring-4 ring-slate-200'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`max-w-[5.5rem] text-center text-[10px] leading-tight font-medium sm:max-w-none sm:text-xs ${
                    isCurrent
                      ? 'text-slate-900'
                      : isUpcoming
                        ? 'text-slate-400'
                        : 'text-slate-600'
                  }`}
                >
                  {SHORT_LABELS[phase]}
                </span>
              </div>
              {index < PHASE_ORDER.length - 1 && (
                <span
                  className={`mx-0.5 h-0.5 w-4 shrink-0 rounded sm:w-8 md:w-12 ${
                    index < currentIndex ? 'bg-emerald-400' : 'bg-slate-200'
                  }`}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
