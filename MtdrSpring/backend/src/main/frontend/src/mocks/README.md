# Testing Pages Without Backend

This folder contains mock fixtures and utilities for testing pages without connecting to the real backend.

## Quick Start

### 1. Enable Mocking

Create or edit `.env.mock` in the project root:

```bash
VITE_USE_MOCKS=true
```

### 2. Run Dev Server

```bash
npm run dev:mock
```

The app will now intercept all API calls and return mock data with a 300ms simulated delay.

**You'll see in console:**

```
Mocking API
```

### 3. Test Pages

- **Login**: Use any email + password (e.g., `test@oracle.com` / `password123`)
- **2FA**: Use any code (not impĺemented yet)
- **Dashboard**: Will load with mock data (pending actions, stats, activity, workload, charts)

## Files

- **fixtures.ts** — Sample data for all pages (users, tasks, teams, etc.)
- **index.ts** — Mock API functions that return fixtures with simulated delay
- **MockedAPI.tsx** — Conditional logic to use mocks vs real backend

## Testing Different Scenarios

Edit `fixtures.ts` to simulate different states:

### Empty State

```ts
export const mockPendingActions = [];
```

### Error State (simulated)

Update mock functions in `index.ts` to throw errors:

```ts
http.get(`${API_BASE}/dashboard/stats`, () => {
  return HttpResponse.json({ message: "Server error" }, { status: 500 });
});
```

### Large Datasets

Expand fixture arrays to test pagination, scrolling, performance:

```ts
export const mockActivity = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  ...
}))
```

## Real Backend - Disable Mocks

Remove `VITE_USE_MOCKS=true` from `.env.mock` or set to `false`:

```bash
VITE_USE_MOCKS=false
```

Then the app will use real API calls to your backend.

## Adding Mocks for New Pages

1. Add fixture data to `fixtures.ts`
2. Add mock function to `mockDashboardAPI` (or similar) in `index.ts`
3. Import `useAPI` in your page instead of `dashboardAPI`:

```tsx
import { useAPI } from "../useAPI";

// in component:
useAPI.dashboard.getPendingActions(); // uses mock if enabled
```
