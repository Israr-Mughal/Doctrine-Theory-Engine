# Governed Workflow Dashboard

Screening prototype for **ABC Roofing LLC** — **2025 S-Corp CPA Review**. A clickable front-end demo that shows governed workflow transitions, CPA approval gates, missing-item/escalation visibility, and an append-only audit log. All state is local and deterministic (no backend).

## Stack

| Layer | Technology |
| --- | --- |
| Build | [Vite](https://vitejs.dev/) |
| UI | [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4 |
| Icons | [lucide-react](https://lucide.dev/) |
| Unit / component tests | [Vitest](https://vitest.dev/) |
| UI testing | [React Testing Library](https://testing-library.com/react) + [@testing-library/user-event](https://testing-library.com/docs/user-event/intro) |
| Test environment | jsdom + [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) |

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+ (comes with Node)

## Project setup

Clone or open the repository, then install dependencies:

```bash
cd governed-workflow-dashboard
npm install
```

## Running the app

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server (default: http://localhost:5173) |
| `npm run build` | Type-check and build for production → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

Example:

```bash
npm run dev
```

Open the URL printed in the terminal to use the dashboard.

## Tests

| Command | Description |
| --- | --- |
| `npm run test` | Run all tests once (CI-friendly) |
| `npm run test:watch` | Run tests in watch mode during development |

Test layout:

- `src/domain/workflow.test.ts` — domain logic (transitions, approval gate, readiness)
- `src/App.test.tsx` — UI flows (dashboard, controls, blockers, audit log)

Example:

```bash
npm run test
```

All tests should pass before submitting or deploying a build.

## Project structure (high level)

```
src/
  domain/           # workflow reducer, transitions, seed data
  components/       # Dashboard, controls, issues, audit log, stepper
  test/setup.ts     # Vitest / jest-dom setup
  App.tsx           # root layout and useReducer wiring
```

## Demo context

- **Client:** ABC Roofing LLC  
- **Engagement:** 2025 S-Corp CPA Review  
- **Workflow phases:** Intake Active → Document Review Active → CPA Review Pending → Filing Readiness Pending → Approved  

Transitions are explicit and sequential; **Approved** requires recorded CPA approval. User actions append structured events to the audit log.
