import { expect, test, type Page, type Route, type Request } from '@playwright/test';
import { installE2EState } from '../support/test-helpers';
import { resetMockState } from '../support/api-mocks';

const TIMELINE_ROUTE = '/timeline';

const TIMELINE_TASKS = [
  {
    id: '132',
    taskId: 132,
    title: 'Unit, component and security testing',
    description: 'Designed testing plan to test our code',
    status: 'DONE',
    priority: 'HIGH',
    responsible: 'Guillermo Sainz',
    responsibleName: 'Guillermo Sainz',
    assignedDevId: '22',
    responsibleId: '22',
    startDate: '2026-06-02',
    dueDate: '2026-06-12',
    createdAt: '2026-06-02T12:00:00Z',
    updatedAt: '2026-06-08T12:00:00Z',
    estimatedHours: 9,
    actualHours: 8,
  },
  {
    id: '69',
    taskId: 69,
    title: 'RBAC system admin',
    description: 'Security architecture',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    responsible: 'Juan Villalobos',
    responsibleName: 'Juan Villalobos',
    assignedDevId: '21',
    responsibleId: '21',
    startDate: '2026-06-03',
    dueDate: '2026-06-11',
    createdAt: '2026-06-03T12:00:00Z',
    updatedAt: '2026-06-09T12:00:00Z',
    estimatedHours: 5,
    actualHours: 2,
  },
  {
    id: '71',
    taskId: 71,
    title: 'Sprint 2 Testing Fundamentals',
    description: 'Weekly module delivery',
    status: 'IN_REVIEW',
    priority: 'MEDIUM',
    responsible: 'Guillermo Sainz',
    responsibleName: 'Guillermo Sainz',
    assignedDevId: '22',
    responsibleId: '22',
    startDate: '2026-06-04',
    dueDate: '2026-06-10',
    createdAt: '2026-06-04T12:00:00Z',
    updatedAt: '2026-06-09T12:00:00Z',
    estimatedHours: 2,
    actualHours: 1,
  },
  {
    id: '201',
    taskId: 201,
    title: 'Create Playwright E2E evidence',
    description: 'Create videos, screenshots, traces and final PDF evidence',
    status: 'TODO',
    priority: 'MEDIUM',
    responsible: 'Guillermo Sainz',
    responsibleName: 'Guillermo Sainz',
    assignedDevId: '22',
    responsibleId: '22',
    startDate: '2026-06-09',
    dueDate: '2026-06-12',
    createdAt: '2026-06-09T12:00:00Z',
    updatedAt: '2026-06-09T12:00:00Z',
    estimatedHours: 4,
    actualHours: null,
  },
];

const MOCK_USER = {
  userId: '22',
  id: 22,
  username: 'Guillermo Sainz',
  name: 'Guillermo Sainz',
  email: 'developer@test.local',
  role: 'DEVELOPER',
  roles: ['DEVELOPER'],
  teamId: '1',
  currentTeamId: '1',
  permissions: ['VIEW_TASKS', 'UPDATE_TASKS', 'VIEW_DASHBOARD'],
};

function corsHeaders(request: Request) {
  const origin = request.headers()['origin'] || 'http://localhost:3000';

  return {
    'access-control-allow-origin': origin,
    'access-control-allow-credentials': 'true',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers': 'Authorization, Content-Type, X-Requested-With',
    vary: 'Origin',
  };
}

async function fulfillCorsPreflight(route: Route) {
  await route.fulfill({
    status: 204,
    headers: corsHeaders(route.request()),
    body: '',
  });
}

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: corsHeaders(route.request()),
    json: body,
  });
}

async function installTimelineNetworkMocks(page: Page) {
  /**
   * AuthContext calls /api/auth/me.
   * We mock it here with CORS credentials support.
   */
  await page.route('**/api/auth/me**', async (route) => {
    const request = route.request();

    if (request.method() === 'OPTIONS') {
      return fulfillCorsPreflight(route);
    }

    console.log(`TIMELINE CORS AUTH MOCK: ${request.method()} ${request.url()}`);

    return fulfillJson(route, {
      ...MOCK_USER,
      user: MOCK_USER,
      authenticated: true,
      token: 'fake-e2e-jwt-token',
      accessToken: 'fake-e2e-jwt-token',
    });
  });

  /**
   * TimelinePage loads tasks through GET /api/tasks.
   * We mock it here with CORS credentials support.
   */
  await page.route('**/api/tasks**', async (route) => {
    const request = route.request();

    if (request.method() === 'OPTIONS') {
      return fulfillCorsPreflight(route);
    }

    if (request.method() !== 'GET') {
      return route.fallback();
    }

    console.log(`TIMELINE CORS TASK MOCK: ${request.method()} ${request.url()}`);

    return fulfillJson(route, TIMELINE_TASKS);
  });
}

async function openTimelineDirect(page: Page, role: 'manager' | 'developer' = 'manager') {
  await installE2EState(page, role);

  /**
   * Register timeline-specific mocks after generic mocks.
   * These have correct CORS headers for requests with credentials.
   */
  await installTimelineNetworkMocks(page);

  const tasksResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes('/api/tasks') &&
      response.request().method() === 'GET' &&
      response.status() === 200
    );
  });

  await page.goto(TIMELINE_ROUTE);

  await tasksResponsePromise;

  await expect(page.locator('body')).not.toContainText(/Sign in to Oracle/i);
  await expect(page.locator('body')).not.toContainText(/Login with Oracle Cloud/i);
}

test.describe('Timeline planning @timeline @mock', () => {
  test.beforeEach(async ({ page }) => {
    resetMockState();

    page.on('pageerror', (error) => {
      console.log(`PAGE ERROR: ${error.message}`);
    });

    page.on('console', (msg) => {
      console.log(`BROWSER CONSOLE ${msg.type()}: ${msg.text()}`);
    });

    await page.clock.setFixedTime(new Date('2026-06-10T12:00:00Z'));
  });

  test('manager can open timeline and see mocked tasks @manager', async ({ page }, testInfo) => {
    test.slow();

    await openTimelineDirect(page, 'manager');

    await expect(page).toHaveURL(/\/timeline/);
    await expect(page.locator('body')).toContainText(/Timeline/i);

    await expect(page.getByText(/Unit, component and security testing/i)).toBeVisible();
    await expect(page.getByText(/RBAC system admin/i)).toBeVisible();
    await expect(page.getByText(/Sprint 2 Testing Fundamentals/i)).toBeVisible();

    await page.screenshot({
      path: testInfo.outputPath('timeline-manager-with-tasks.png'),
      fullPage: true,
    });
  });

  test('developer can open timeline without login flow @developer', async ({ page }) => {
    await openTimelineDirect(page, 'developer');

    await expect(page).toHaveURL(/\/timeline/);
    await expect(page.locator('body')).not.toContainText(/Login with Oracle Cloud/i);

    await expect(page.getByText(/Create Playwright E2E evidence/i)).toBeVisible();
  });

  const expectedTasks = [
    'Unit, component and security testing',
    'RBAC system admin',
    'Sprint 2 Testing Fundamentals',
    'Create Playwright E2E evidence',
  ];

  for (const title of expectedTasks) {
    test(`timeline displays mocked task: ${title} @parameterized`, async ({ page }) => {
      await openTimelineDirect(page, 'manager');

      await expect(page.getByText(new RegExp(title, 'i'))).toBeVisible();
    });
  }

  test('timeline keeps date-sensitive UI stable with fixed clock @clock', async ({ page }, testInfo) => {
    await openTimelineDirect(page, 'manager');

    await expect(page).toHaveURL(/\/timeline/);
    await expect(page.locator('body')).toContainText(/Today|Jun|Timeline/i);

    await page.screenshot({
      path: testInfo.outputPath('timeline-fixed-clock.png'),
      fullPage: true,
    });
  });
});