import {
  createAuditEvent,
  resetAuditIdCounter,
  type EngagementState,
} from './workflow'

export function createInitialEngagementState(): EngagementState {
  resetAuditIdCounter()

  const createdEvent = createAuditEvent(
    'engagement created',
    'System',
    'Engagement created for ABC Roofing LLC — 2025 S-Corp CPA Review.',
    {
      client: 'ABC Roofing LLC',
      engagement: '2025 S-Corp CPA Review',
    },
  )

  return {
    clientName: 'ABC Roofing LLC',
    engagementName: '2025 S-Corp CPA Review',
    phase: 'Intake Active',
    missingItems: [
      {
        id: 'missing-seed-1',
        description: 'Signed 1120-S officer confirmation',
        resolved: false,
      },
    ],
    escalations: [
      {
        id: 'escalation-seed-1',
        description: 'Client has not provided final bank statement',
        resolved: false,
      },
    ],
    cpaApproved: false,
    auditLog: [createdEvent],
    validationMessage: null,
  }
}
