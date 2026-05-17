import { useCallback, useReducer } from 'react'
import { Info } from 'lucide-react'
import { AuditLog } from './components/AuditLog'
import { DashboardSummary } from './components/DashboardSummary'
import { IssuesPanel } from './components/IssuesPanel'
import { WorkflowControls } from './components/WorkflowControls'
import { createInitialEngagementState } from './domain/seedData'
import { workflowReducer } from './domain/workflow'

const TECHNICAL_COPY = `Stack: React, TypeScript, Vite, Tailwind, Vitest, React Testing Library.
Workflow control: transitions are governed by an allowed transition map and reducer actions.
Approval gate: the reducer blocks Approved unless CPA approval has been recorded.
Audit log: each action appends a structured event with timestamp, actor, type, and message.
Production improvements: backend persistence, authentication/RBAC, real document checklist, immutable audit storage, database constraints, server-side workflow validation, notifications, SLA timers, and CPA e-signature integration.`

function App() {
  const [state, dispatch] = useReducer(
    workflowReducer,
    undefined,
    createInitialEngagementState,
  )

  const handleReset = useCallback(() => {
    dispatch({
      type: 'RESET_DEMO',
      initialState: createInitialEngagementState(),
    })
  }, [])

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p className="truncate text-sm font-semibold text-slate-800">
            {state.clientName}
          </p>
          <p className="hidden truncate text-sm text-slate-500 sm:block">
            {state.engagementName}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <DashboardSummary state={state} />

        <WorkflowControls
          state={state}
          dispatch={dispatch}
          onReset={handleReset}
        />

        <IssuesPanel state={state} dispatch={dispatch} />

        <AuditLog events={state.auditLog} />

        <details className="group rounded-xl border border-slate-200 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 marker:content-none sm:px-5 [&::-webkit-details-marker]:hidden">
            <Info className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            About this prototype
            <span className="ml-auto text-xs font-normal text-slate-400 group-open:hidden">
              Show technical notes
            </span>
          </summary>
          <div className="border-t border-slate-100 px-4 pb-4 pt-2 text-sm leading-relaxed text-slate-600 sm:px-5">
            <p className="whitespace-pre-line">{TECHNICAL_COPY}</p>
          </div>
        </details>
      </main>
    </div>
  )
}

export default App
