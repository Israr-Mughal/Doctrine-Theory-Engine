import { describe, expect, it, beforeEach } from 'vitest'
import {
  canTransition,
  createAuditEvent,
  getNextPhase,
  getReadinessStatus,
  resetAuditIdCounter,
  workflowReducer,
  type EngagementState,
} from './workflow'
import { createInitialEngagementState } from './seedData'

describe('initial engagement state', () => {
  let state: EngagementState

  beforeEach(() => {
    state = createInitialEngagementState()
  })

  it('has correct client, engagement, phase, items, escalation, and CPA approval', () => {
    expect(state.clientName).toBe('ABC Roofing LLC')
    expect(state.engagementName).toBe('2025 S-Corp CPA Review')
    expect(state.phase).toBe('Intake Active')
    expect(state.missingItems).toHaveLength(1)
    expect(state.missingItems[0].description).toBe(
      'Signed 1120-S officer confirmation',
    )
    expect(state.escalations).toHaveLength(1)
    expect(state.escalations[0].description).toBe(
      'Client has not provided final bank statement',
    )
    expect(state.cpaApproved).toBe(false)
    expect(state.auditLog[0].eventType).toBe('engagement created')
  })
})

describe('valid state transition', () => {
  it('moves from Intake Active to Document Review Active and records audit event', () => {
    const state = createInitialEngagementState()
    const next = workflowReducer(state, { type: 'ADVANCE_WORKFLOW' })

    expect(next.phase).toBe('Document Review Active')
    expect(
      next.auditLog.some(
        (e) =>
          e.eventType === 'status changed' &&
          e.message.includes('Document Review Active'),
      ),
    ).toBe(true)
  })
})

describe('invalid transition', () => {
  it('cannot jump from Intake Active to Approved', () => {
    expect(
      canTransition('Intake Active', 'Approved', true),
    ).toBe(false)

    const state = createInitialEngagementState()
    const next = workflowReducer(state, { type: 'ADVANCE_WORKFLOW' })
    expect(next.phase).not.toBe('Approved')
  })
})

describe('approval gate', () => {
  function reachFilingReadiness(state: EngagementState): EngagementState {
    let current = state
    current = workflowReducer(current, { type: 'ADVANCE_WORKFLOW' })
    current = workflowReducer(current, { type: 'ADVANCE_WORKFLOW' })
    current = workflowReducer(current, { type: 'ADVANCE_WORKFLOW' })
    expect(current.phase).toBe('Filing Readiness Pending')
    return current
  }

  it('blocks Approved without CPA approval and records blocked event', () => {
    const atFiling = reachFilingReadiness(createInitialEngagementState())
    const blocked = workflowReducer(atFiling, { type: 'ADVANCE_WORKFLOW' })

    expect(blocked.phase).toBe('Filing Readiness Pending')
    expect(blocked.cpaApproved).toBe(false)
    expect(blocked.validationMessage).toContain('CPA approval')
    expect(
      blocked.auditLog.some((e) => e.eventType === 'blocked approval attempt'),
    ).toBe(true)
  })
})

describe('approval success', () => {
  it('records CPA approval then allows transition to Approved', () => {
    let state = createInitialEngagementState()
    state = workflowReducer(state, { type: 'ADVANCE_WORKFLOW' })
    state = workflowReducer(state, { type: 'ADVANCE_WORKFLOW' })
    state = workflowReducer(state, { type: 'ADVANCE_WORKFLOW' })
    expect(state.phase).toBe('Filing Readiness Pending')

    state = workflowReducer(state, { type: 'RECORD_CPA_APPROVAL' })
    expect(state.cpaApproved).toBe(true)
    expect(
      state.auditLog.some((e) => e.eventType === 'CPA approval recorded'),
    ).toBe(true)

    state = workflowReducer(state, { type: 'ADVANCE_WORKFLOW' })
    expect(state.phase).toBe('Approved')
  })
})

describe('readiness logic', () => {
  it('returns Not Ready when missing items or escalations exist', () => {
    const state = createInitialEngagementState()
    expect(getReadinessStatus(state)).toBe('Not Ready')
  })

  it('returns Ready for Filing when no issues and CPA approved', () => {
    let state = createInitialEngagementState()
    state = {
      ...state,
      missingItems: state.missingItems.map((m) => ({ ...m, resolved: true })),
      escalations: state.escalations.map((e) => ({ ...e, resolved: true })),
      cpaApproved: true,
      phase: 'Filing Readiness Pending',
    }
    expect(getReadinessStatus(state)).toBe('Ready for Filing')
  })

  it('returns Approved when phase is Approved', () => {
    const state = {
      ...createInitialEngagementState(),
      phase: 'Approved' as const,
    }
    expect(getReadinessStatus(state)).toBe('Approved')
  })
})

describe('transition helpers', () => {
  beforeEach(() => {
    resetAuditIdCounter()
  })

  it('getNextPhase returns the allowed next phase', () => {
    expect(getNextPhase('Intake Active')).toBe('Document Review Active')
    expect(getNextPhase('Approved')).toBeNull()
  })

  it('createAuditEvent assigns sequential ids', () => {
    const first = createAuditEvent('status changed', 'System', 'First')
    const second = createAuditEvent('status changed', 'System', 'Second')
    expect(first.id).toBe('evt-0001')
    expect(second.id).toBe('evt-0002')
  })
})
