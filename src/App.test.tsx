import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Governed Workflow Dashboard UI', () => {
  it('renders dashboard summary fields', () => {
    render(<App />)

    expect(screen.getAllByText('ABC Roofing LLC').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2025 S-Corp CPA Review').length).toBeGreaterThan(
      0,
    )
    expect(screen.getByTestId('workflow-phase-status')).toHaveTextContent(
      'Intake Active',
    )
    expect(screen.getByTestId('readiness-status')).toHaveTextContent('Not Ready')
    expect(screen.getByTestId('missing-items-status')).toHaveTextContent('1')
    expect(screen.getByTestId('missing-items-status')).toHaveTextContent('open')
    expect(screen.getByTestId('escalation-status')).toHaveTextContent('Active')
    expect(screen.getByTestId('cpa-approval-status')).toHaveTextContent(
      'Pending',
    )
  })

  it('advances only to the next valid phase on transition click', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', {
        name: /Advance to Document Review Active/i,
      }),
    )
    expect(screen.getByTestId('workflow-phase-status')).toHaveTextContent(
      'Document Review Active',
    )

    await user.click(
      screen.getByRole('button', { name: /Advance to CPA Review Pending/i }),
    )
    expect(screen.getByTestId('workflow-phase-status')).toHaveTextContent(
      'CPA Review Pending',
    )

    await user.click(
      screen.getByRole('button', {
        name: /Advance to Filing Readiness Pending/i,
      }),
    )
    expect(screen.getByTestId('workflow-phase-status')).toHaveTextContent(
      'Filing Readiness Pending',
    )
  })

  it('blocks Approved transition until CPA approval is recorded', async () => {
    const user = userEvent.setup()
    render(<App />)

    for (let i = 0; i < 3; i += 1) {
      const btn = screen.getByRole('button', { name: /^Advance to /i })
      await user.click(btn)
    }

    const approveBtn = screen.getByRole('button', {
      name: /Advance to Approved/i,
    })
    expect(approveBtn).toBeDisabled()

    await user.click(approveBtn)
    expect(screen.getByTestId('workflow-phase-status')).toHaveTextContent(
      'Filing Readiness Pending',
    )
  })

  it('updates missing item count when an item is resolved', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByTestId('missing-items-status')).toHaveTextContent('1')

    await user.click(
      screen.getByRole('button', {
        name: /Resolve missing item: Signed 1120-S officer confirmation/i,
      }),
    )

    expect(screen.getByTestId('missing-items-status')).toHaveTextContent('Clear')
    expect(screen.getByTestId('missing-items-status')).not.toHaveTextContent('1')
  })

  it('updates escalation status when escalation is resolved', async () => {
    const user = userEvent.setup()
    render(<App />)

    const escalationSection = screen.getByLabelText('Escalations list')
    await user.click(
      within(escalationSection).getByRole('button', {
        name: /Resolve escalation: Client has not provided final bank statement/i,
      }),
    )

    expect(screen.getByTestId('escalation-status')).toHaveTextContent('None')
    expect(
      within(escalationSection).queryByRole('button', {
        name: /Resolve escalation/i,
      }),
    ).not.toBeInTheDocument()
  })

  it('displays audit events for key actions', async () => {
    const user = userEvent.setup()
    render(<App />)

    const timeline = screen.getByLabelText('Audit event timeline')
    expect(
      within(timeline).getAllByText(/engagement created/i).length,
    ).toBeGreaterThan(0)

    await user.click(
      screen.getByRole('button', {
        name: /Advance to Document Review Active/i,
      }),
    )
    expect(within(timeline).getByText(/^status changed$/i)).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: /Resolve missing item: Signed 1120-S officer confirmation/i,
      }),
    )
    expect(
      within(timeline).getByText(/^missing item resolved$/i),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: /Resolve escalation: Client has not provided final bank statement/i,
      }),
    )
    expect(
      within(timeline).getByText(/^escalation resolved$/i),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /Record CPA approval/i }),
    )
    expect(
      within(timeline).getByText(/^CPA approval recorded$/i),
    ).toBeInTheDocument()
  })
})
