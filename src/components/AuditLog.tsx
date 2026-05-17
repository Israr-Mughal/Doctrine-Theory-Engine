import { AlertOctagon, Clock } from 'lucide-react'
import type { AuditEvent } from '../domain/workflow'

interface AuditLogProps {
  events: AuditEvent[]
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return iso
  }
}

export function AuditLog({ events }: AuditLogProps) {
  const ordered = [...events].reverse()

  return (
    <section
      aria-labelledby="audit-log-heading"
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <h2
          id="audit-log-heading"
          className="text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Audit / event log
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Append-only trail · newest first · {events.length} event
          {events.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="max-h-[28rem] overflow-y-auto px-4 py-4 sm:max-h-[32rem] sm:px-5">
        <ol className="space-y-0" aria-label="Audit event timeline">
          {ordered.map((event, index) => {
            const isBlocked = event.eventType === 'blocked approval attempt'
            const isLast = index === ordered.length - 1

            return (
              <li key={event.id} className="relative flex gap-3 pb-5 sm:gap-4">
                {!isLast && (
                  <span
                    className="absolute left-[11px] top-7 h-[calc(100%-0.5rem)] w-px bg-slate-200"
                    aria-hidden
                  />
                )}
                <span
                  className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    isBlocked
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isBlocked ? (
                    <AlertOctagon className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                  )}
                </span>
                <article
                  className={`min-w-0 flex-1 rounded-lg border px-3 py-2.5 sm:px-4 ${
                    isBlocked
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                    <span className="font-mono text-[11px] text-slate-500">
                      {event.id}
                    </span>
                    <span className="w-fit rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700">
                      {event.eventType}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {event.actor}
                    </span>
                    <time
                      className="text-[11px] text-slate-400 sm:ml-auto"
                      dateTime={event.timestamp}
                    >
                      {formatTime(event.timestamp)}
                    </time>
                  </div>
                  <p
                    className={`mt-1.5 text-sm leading-snug ${
                      isBlocked
                        ? 'font-medium text-amber-950'
                        : 'text-slate-800'
                    }`}
                  >
                    {event.message}
                  </p>
                </article>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
