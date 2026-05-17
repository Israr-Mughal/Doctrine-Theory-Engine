import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Plus } from 'lucide-react'
import type { EngagementState, WorkflowAction } from '../domain/workflow'
import { getUnresolvedMissingCount, hasActiveEscalation } from '../domain/workflow'

interface IssuesPanelProps {
  state: EngagementState
  dispatch: React.Dispatch<WorkflowAction>
}

function IssueListItem({
  description,
  resolved,
  variant,
  onResolve,
  resolveLabel,
}: {
  description: string
  resolved: boolean
  variant: 'missing' | 'escalation'
  onResolve: () => void
  resolveLabel: string
}) {
  const openStyles =
    variant === 'missing'
      ? 'border-amber-200 bg-amber-50/80'
      : 'border-red-200 bg-red-50/80'

  return (
    <li
      className={`flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${
        resolved
          ? 'border-slate-200 bg-slate-50/50'
          : openStyles
      }`}
    >
      <div className="flex min-w-0 items-start gap-2">
        {resolved ? (
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
            aria-hidden
          />
        ) : variant === 'escalation' ? (
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
            aria-hidden
          />
        ) : null}
        <span
          className={`text-sm leading-snug ${
            resolved ? 'text-slate-500 line-through' : 'text-slate-900'
          }`}
        >
          {description}
        </span>
      </div>
      {!resolved && (
        <button
          type="button"
          aria-label={resolveLabel}
          onClick={onResolve}
          className="w-full shrink-0 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 sm:w-auto"
        >
          Mark resolved
        </button>
      )}
    </li>
  )
}

export function IssuesPanel({ state, dispatch }: IssuesPanelProps) {
  const [missingInput, setMissingInput] = useState('')
  const [escalationInput, setEscalationInput] = useState('')
  const openMissing = state.missingItems.filter((m) => !m.resolved)
  const resolvedMissing = state.missingItems.filter((m) => m.resolved)
  const openEscalations = state.escalations.filter((e) => !e.resolved)
  const resolvedEscalations = state.escalations.filter((e) => e.resolved)

  const handleAddMissing = () => {
    const trimmed = missingInput.trim()
    if (!trimmed) return
    dispatch({ type: 'ADD_MISSING_ITEM', description: trimmed })
    setMissingInput('')
  }

  const handleAddEscalation = () => {
    const trimmed = escalationInput.trim()
    if (!trimmed) return
    dispatch({ type: 'ADD_ESCALATION', description: trimmed })
    setEscalationInput('')
  }

  return (
    <section
      aria-labelledby="issues-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="issues-heading"
            className="text-sm font-semibold uppercase tracking-wide text-slate-500"
          >
            Blockers
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Resolve open items to improve readiness before filing.
          </p>
        </div>
        <p className="text-xs font-medium text-slate-500">
          {getUnresolvedMissingCount(state.missingItems)} missing ·{' '}
          {hasActiveEscalation(state.escalations)
            ? 'escalation active'
            : 'no escalations'}
        </p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            Missing items
            {openMissing.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                {openMissing.length} open
              </span>
            )}
          </h3>

          <ul className="mt-3 space-y-2" aria-label="Missing items list">
            {openMissing.length === 0 ? (
              <li className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500">
                No open missing items
              </li>
            ) : (
              openMissing.map((item) => (
                <IssueListItem
                  key={item.id}
                  description={item.description}
                  resolved={false}
                  variant="missing"
                  resolveLabel={`Resolve missing item: ${item.description}`}
                  onResolve={() =>
                    dispatch({ type: 'RESOLVE_MISSING_ITEM', id: item.id })
                  }
                />
              ))
            )}
          </ul>

          <form
            className="mt-4 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              handleAddMissing()
            }}
          >
            <input
              type="text"
              aria-label="New missing item description"
              value={missingInput}
              onChange={(e) => setMissingInput(e.target.value)}
              placeholder="Add a missing document or item…"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <button
              type="submit"
              aria-label="Add missing item"
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add item
            </button>
          </form>

          {resolvedMissing.length > 0 && (
            <details className="mt-4 group">
              <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700">
                {resolvedMissing.length} resolved item
                {resolvedMissing.length !== 1 ? 's' : ''}
              </summary>
              <ul className="mt-2 space-y-2">
                {resolvedMissing.map((item) => (
                  <IssueListItem
                    key={item.id}
                    description={item.description}
                    resolved
                    variant="missing"
                    resolveLabel=""
                    onResolve={() => undefined}
                  />
                ))}
              </ul>
            </details>
          )}
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            Escalations
            {openEscalations.length > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-900">
                {openEscalations.length} active
              </span>
            )}
          </h3>

          <ul className="mt-3 space-y-2" aria-label="Escalations list">
            {openEscalations.length === 0 ? (
              <li className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500">
                No active escalations
              </li>
            ) : (
              openEscalations.map((escalation) => (
                <IssueListItem
                  key={escalation.id}
                  description={escalation.description}
                  resolved={false}
                  variant="escalation"
                  resolveLabel={`Resolve escalation: ${escalation.description}`}
                  onResolve={() =>
                    dispatch({
                      type: 'RESOLVE_ESCALATION',
                      id: escalation.id,
                    })
                  }
                />
              ))
            )}
          </ul>

          <form
            className="mt-4 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              handleAddEscalation()
            }}
          >
            <input
              type="text"
              aria-label="New escalation description"
              value={escalationInput}
              onChange={(e) => setEscalationInput(e.target.value)}
              placeholder="Add an escalation reason…"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <button
              type="submit"
              aria-label="Add escalation"
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add escalation
            </button>
          </form>

          {resolvedEscalations.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700">
                {resolvedEscalations.length} resolved escalation
                {resolvedEscalations.length !== 1 ? 's' : ''}
              </summary>
              <ul className="mt-2 space-y-2">
                {resolvedEscalations.map((escalation) => (
                  <IssueListItem
                    key={escalation.id}
                    description={escalation.description}
                    resolved
                    variant="escalation"
                    resolveLabel=""
                    onResolve={() => undefined}
                  />
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    </section>
  )
}
