import type { ReactNode } from 'react'
import {
  getReadinessStatus,
  getUnresolvedMissingCount,
  hasActiveEscalation,
  type EngagementState,
} from '../domain/workflow'
import { StatusBadge, type BadgeVariant } from './StatusBadge'
import { WorkflowStepper } from './WorkflowStepper'

interface DashboardSummaryProps {
  state: EngagementState
}

function MetricCard({
  label,
  children,
  testId,
}: {
  label: string
  children: ReactNode
  testId?: string
}) {
  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-3" data-testid={testId}>
        {children}
      </div>
    </article>
  )
}

function readinessVariant(readiness: string): BadgeVariant {
  if (readiness === 'Approved') return 'success'
  if (readiness === 'Ready for Filing') return 'info'
  return 'warning'
}

export function DashboardSummary({ state }: DashboardSummaryProps) {
  const missingCount = getUnresolvedMissingCount(state.missingItems)
  const escalationActive = hasActiveEscalation(state.escalations)
  const readiness = getReadinessStatus(state)

  return (
    <section aria-labelledby="dashboard-heading" className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Screening prototype
        </p>
        <h1
          id="dashboard-heading"
          className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl"
        >
          Governed Workflow Dashboard
        </h1>
        <p className="mt-1 max-w-xl text-sm text-slate-600">
          Resolve blockers, record CPA approval, then advance one governed step
          at a time.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Workflow progress
        </p>
        <WorkflowStepper currentPhase={state.phase} />
        <p className="mt-3 text-sm text-slate-600">
          <span className="font-medium text-slate-900">Current phase:</span>{' '}
          {state.phase}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <MetricCard label="Readiness" testId="readiness-status">
          <StatusBadge variant={readinessVariant(readiness)} size="lg">
            {readiness}
          </StatusBadge>
        </MetricCard>
        <MetricCard label="Missing items" testId="missing-items-status">
          {missingCount > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-900">
                {missingCount}
              </span>
              <StatusBadge variant="warning">open</StatusBadge>
            </div>
          ) : (
            <StatusBadge variant="success" size="lg">
              Clear
            </StatusBadge>
          )}
        </MetricCard>
        <MetricCard label="Escalations" testId="escalation-status">
          {escalationActive ? (
            <StatusBadge variant="danger" size="lg">
              Active
            </StatusBadge>
          ) : (
            <StatusBadge variant="success" size="lg">
              None
            </StatusBadge>
          )}
        </MetricCard>
        <MetricCard label="CPA approval" testId="cpa-approval-status">
          {state.cpaApproved ? (
            <StatusBadge variant="success" size="lg">
              Recorded
            </StatusBadge>
          ) : (
            <StatusBadge variant="warning" size="lg">
              Pending
            </StatusBadge>
          )}
        </MetricCard>
        <MetricCard label="Workflow phase" testId="workflow-phase-status">
          <StatusBadge variant="info" size="lg">
            {state.phase}
          </StatusBadge>
        </MetricCard>
      </div>
    </section>
  )
}
