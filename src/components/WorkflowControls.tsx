import { ArrowRight, Lock, RotateCcw, ShieldCheck } from 'lucide-react'
import {
  canTransition,
  getNextPhase,
  type EngagementState,
  type WorkflowAction,
} from '../domain/workflow'

interface WorkflowControlsProps {
  state: EngagementState
  dispatch: React.Dispatch<WorkflowAction>
  onReset: () => void
}

export function WorkflowControls({
  state,
  dispatch,
  onReset,
}: WorkflowControlsProps) {
  const nextPhase = getNextPhase(state.phase)
  const needsCpaForApproval =
    nextPhase === 'Approved' && !state.cpaApproved
  const canAdvance =
    nextPhase !== null &&
    canTransition(state.phase, nextPhase, state.cpaApproved)

  const transitionLabel = nextPhase
    ? `Advance to ${nextPhase}`
    : 'Workflow complete'

  const blockReason = needsCpaForApproval
    ? 'Record CPA approval before advancing to Approved.'
    : !nextPhase
      ? 'This engagement has reached the final phase.'
      : null

  return (
    <section
      aria-labelledby="workflow-controls-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="workflow-controls-heading"
            className="text-sm font-semibold uppercase tracking-wide text-slate-500"
          >
            Next action
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Only the next governed transition is available — no manual status
            picker.
          </p>
        </div>
        <p className="mt-2 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 sm:mt-0">
          You are here:{' '}
          <span className="text-slate-900">{state.phase}</span>
        </p>
      </div>

      {nextPhase && (
        <p className="mt-4 text-sm text-slate-700">
          <span className="font-medium text-slate-900">Up next:</span>{' '}
          {nextPhase}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          aria-label={transitionLabel}
          disabled={!canAdvance}
          title={blockReason ?? undefined}
          onClick={() => dispatch({ type: 'ADVANCE_WORKFLOW' })}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto sm:min-w-[14rem]"
        >
          {needsCpaForApproval && !canAdvance ? (
            <Lock className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          )}
          {transitionLabel}
        </button>

        <button
          type="button"
          aria-label="Record CPA approval"
          disabled={state.cpaApproved}
          onClick={() => dispatch({ type: 'RECORD_CPA_APPROVAL' })}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-emerald-600 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 sm:w-auto"
        >
          <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
          {state.cpaApproved ? 'CPA approval recorded' : 'Record CPA approval'}
        </button>

        <button
          type="button"
          aria-label="Reset demo state"
          onClick={onReset}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:ml-auto sm:w-auto"
        >
          <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
          Reset demo
        </button>
      </div>

      {blockReason && !state.validationMessage && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
          {blockReason}
        </p>
      )}

      {state.validationMessage && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950"
        >
          {state.validationMessage}
        </p>
      )}
    </section>
  )
}
