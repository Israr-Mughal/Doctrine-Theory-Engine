export type WorkflowPhase =
  | 'Intake Active'
  | 'Document Review Active'
  | 'CPA Review Pending'
  | 'Filing Readiness Pending'
  | 'Approved'

export type ReadinessStatus = 'Not Ready' | 'Ready for Filing' | 'Approved'

export type AuditEventType =
  | 'engagement created'
  | 'status changed'
  | 'missing item added'
  | 'missing item resolved'
  | 'escalation added'
  | 'escalation resolved'
  | 'CPA approval recorded'
  | 'approval status changed'
  | 'blocked approval attempt'

export interface AuditEvent {
  id: string
  timestamp: string
  eventType: AuditEventType
  actor: string
  message: string
  metadata?: Record<string, string>
}

export interface MissingItem {
  id: string
  description: string
  resolved: boolean
}

export interface Escalation {
  id: string
  description: string
  resolved: boolean
}

export interface EngagementState {
  clientName: string
  engagementName: string
  phase: WorkflowPhase
  missingItems: MissingItem[]
  escalations: Escalation[]
  cpaApproved: boolean
  auditLog: AuditEvent[]
  validationMessage: string | null
}

export const allowedTransitions: Record<WorkflowPhase, WorkflowPhase | null> = {
  'Intake Active': 'Document Review Active',
  'Document Review Active': 'CPA Review Pending',
  'CPA Review Pending': 'Filing Readiness Pending',
  'Filing Readiness Pending': 'Approved',
  Approved: null,
}

export function getNextPhase(phase: WorkflowPhase): WorkflowPhase | null {
  return allowedTransitions[phase]
}

export function canTransition(
  from: WorkflowPhase,
  to: WorkflowPhase,
  cpaApproved: boolean,
): boolean {
  if (allowedTransitions[from] !== to) {
    return false
  }
  if (to === 'Approved' && !cpaApproved) {
    return false
  }
  return true
}

export function getUnresolvedMissingCount(items: MissingItem[]): number {
  return items.filter((item) => !item.resolved).length
}

export function hasActiveEscalation(escalations: Escalation[]): boolean {
  return escalations.some((escalation) => !escalation.resolved)
}

export function getReadinessStatus(state: {
  phase: WorkflowPhase
  missingItems: MissingItem[]
  escalations: Escalation[]
  cpaApproved: boolean
}): ReadinessStatus {
  if (state.phase === 'Approved') {
    return 'Approved'
  }

  const hasIssues =
    getUnresolvedMissingCount(state.missingItems) > 0 ||
    hasActiveEscalation(state.escalations)

  if (hasIssues) {
    return 'Not Ready'
  }

  if (state.cpaApproved) {
    return 'Ready for Filing'
  }

  return 'Not Ready'
}

let auditIdCounter = 0

export function resetAuditIdCounter(): void {
  auditIdCounter = 0
}

export function createAuditEvent(
  eventType: AuditEventType,
  actor: string,
  message: string,
  metadata?: Record<string, string>,
): AuditEvent {
  auditIdCounter += 1
  return {
    id: `evt-${String(auditIdCounter).padStart(4, '0')}`,
    timestamp: new Date().toISOString(),
    eventType,
    actor,
    message,
    metadata,
  }
}

export type WorkflowAction =
  | { type: 'ADVANCE_WORKFLOW' }
  | { type: 'ADD_MISSING_ITEM'; description: string }
  | { type: 'RESOLVE_MISSING_ITEM'; id: string }
  | { type: 'ADD_ESCALATION'; description: string }
  | { type: 'RESOLVE_ESCALATION'; id: string }
  | { type: 'RECORD_CPA_APPROVAL' }
  | { type: 'RESET_DEMO'; initialState: EngagementState }

export function workflowReducer(
  state: EngagementState,
  action: WorkflowAction,
): EngagementState {
  switch (action.type) {
    case 'ADVANCE_WORKFLOW': {
      const nextPhase = getNextPhase(state.phase)
      if (!nextPhase) {
        return state
      }

      if (!canTransition(state.phase, nextPhase, state.cpaApproved)) {
        if (nextPhase === 'Approved' && !state.cpaApproved) {
          const blockedEvent = createAuditEvent(
            'blocked approval attempt',
            'Workflow Manager',
            'Transition to Approved blocked: CPA approval has not been recorded.',
            { from: state.phase, to: nextPhase },
          )
          return {
            ...state,
            validationMessage:
              'Cannot approve engagement until CPA approval has been recorded.',
            auditLog: [...state.auditLog, blockedEvent],
          }
        }
        return state
      }

      const statusEvent = createAuditEvent(
        'status changed',
        'Workflow Manager',
        `Workflow phase changed from "${state.phase}" to "${nextPhase}".`,
        { from: state.phase, to: nextPhase },
      )

      return {
        ...state,
        phase: nextPhase,
        validationMessage: null,
        auditLog: [...state.auditLog, statusEvent],
      }
    }

    case 'ADD_MISSING_ITEM': {
      const id = `missing-${state.missingItems.length + 1}-${Date.now()}`
      const item: MissingItem = {
        id,
        description: action.description,
        resolved: false,
      }
      const event = createAuditEvent(
        'missing item added',
        'Workflow Manager',
        `Missing item added: "${action.description}".`,
        { itemId: id },
      )
      return {
        ...state,
        missingItems: [...state.missingItems, item],
        validationMessage: null,
        auditLog: [...state.auditLog, event],
      }
    }

    case 'RESOLVE_MISSING_ITEM': {
      const item = state.missingItems.find((m) => m.id === action.id)
      if (!item || item.resolved) {
        return state
      }
      const event = createAuditEvent(
        'missing item resolved',
        'Workflow Manager',
        `Missing item resolved: "${item.description}".`,
        { itemId: action.id },
      )
      return {
        ...state,
        missingItems: state.missingItems.map((m) =>
          m.id === action.id ? { ...m, resolved: true } : m,
        ),
        validationMessage: null,
        auditLog: [...state.auditLog, event],
      }
    }

    case 'ADD_ESCALATION': {
      const id = `escalation-${state.escalations.length + 1}-${Date.now()}`
      const escalation: Escalation = {
        id,
        description: action.description,
        resolved: false,
      }
      const event = createAuditEvent(
        'escalation added',
        'Workflow Manager',
        `Escalation added: "${action.description}".`,
        { escalationId: id },
      )
      return {
        ...state,
        escalations: [...state.escalations, escalation],
        validationMessage: null,
        auditLog: [...state.auditLog, event],
      }
    }

    case 'RESOLVE_ESCALATION': {
      const escalation = state.escalations.find((e) => e.id === action.id)
      if (!escalation || escalation.resolved) {
        return state
      }
      const event = createAuditEvent(
        'escalation resolved',
        'Workflow Manager',
        `Escalation resolved: "${escalation.description}".`,
        { escalationId: action.id },
      )
      return {
        ...state,
        escalations: state.escalations.map((e) =>
          e.id === action.id ? { ...e, resolved: true } : e,
        ),
        validationMessage: null,
        auditLog: [...state.auditLog, event],
      }
    }

    case 'RECORD_CPA_APPROVAL': {
      if (state.cpaApproved) {
        return state
      }
      const approvalEvent = createAuditEvent(
        'CPA approval recorded',
        'CPA',
        'CPA approval recorded for engagement.',
      )
      const statusEvent = createAuditEvent(
        'approval status changed',
        'System',
        'CPA approval status changed to Approved.',
        { cpaApproved: 'true' },
      )
      return {
        ...state,
        cpaApproved: true,
        validationMessage: null,
        auditLog: [...state.auditLog, approvalEvent, statusEvent],
      }
    }

    case 'RESET_DEMO':
      return {
        ...action.initialState,
        validationMessage: null,
      }

    default:
      return state
  }
}
