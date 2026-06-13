import { Page, Route } from '@playwright/test';

export type UserRole = 'manager' | 'developer';

export const FRONTEND_URL = 'http://localhost:3000';
export const TEST_TOKEN = 'fake-e2e-jwt-token';

export const USERS = {
  manager: {
    userId: '21',
    id: 21,
    username: 'Juan Villalobos',
    name: 'Juan Villalobos',
    email: 'manager@test.local',
    role: 'MANAGER',
    roles: ['MANAGER'],
    teamId: '1',
    currentTeamId: '1',
    permissions: ['VIEW_DASHBOARD', 'MANAGE_TASKS', 'VIEW_TASKS'],
  },
  developer: {
    userId: '22',
    id: 22,
    username: 'Guillermo Sainz',
    name: 'Guillermo Sainz',
    email: 'developer@test.local',
    role: 'DEVELOPER',
    roles: ['DEVELOPER'],
    teamId: '1',
    currentTeamId: '1',
    permissions: ['VIEW_TASKS', 'UPDATE_TASKS'],
  },
};

export const TASKS = [
  {
    taskId: 132,
    id: '132',
    title: 'Unit, component and security testing',
    description: 'Designed testing plan to test our code',
    status: 'DONE',
    priority: 'HIGH',
    sprintId: 24,
    sprintName: 'Sprint 5',
    responsibleId: '22',
    assignedDevId: '22',
    responsible: 'Guillermo Sainz',
    responsibleName: 'Guillermo Sainz',
    estimatedHours: 9,
    actualHours: 8,
    startDate: '2026-06-02',
    dueDate: '2026-06-12',
    createdAt: '2026-06-02T12:00:00Z',
    updatedAt: '2026-06-08T12:00:00Z',
  },
  {
    taskId: 69,
    id: '69',
    title: 'RBAC system admin',
    description: 'Security architecture',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    sprintId: 24,
    sprintName: 'Sprint 5',
    responsibleId: '21',
    assignedDevId: '21',
    responsible: 'Juan Villalobos',
    responsibleName: 'Juan Villalobos',
    estimatedHours: 5,
    actualHours: 2,
    startDate: '2026-06-03',
    dueDate: '2026-06-11',
    createdAt: '2026-06-03T12:00:00Z',
    updatedAt: '2026-06-09T12:00:00Z',
  },
  {
    taskId: 71,
    id: '71',
    title: 'Sprint 2 Testing Fundamentals',
    description: 'Weekly module delivery',
    status: 'IN_REVIEW',
    priority: 'MEDIUM',
    sprintId: 24,
    sprintName: 'Sprint 5',
    responsibleId: '22',
    assignedDevId: '22',
    responsible: 'Guillermo Sainz',
    responsibleName: 'Guillermo Sainz',
    estimatedHours: 2,
    actualHours: 1,
    startDate: '2026-06-04',
    dueDate: '2026-06-10',
    createdAt: '2026-06-04T12:00:00Z',
    updatedAt: '2026-06-09T12:00:00Z',
  },
  {
    taskId: 201,
    id: '201',
    title: 'Create Playwright E2E evidence',
    description: 'Create videos, screenshots, traces and final PDF evidence',
    status: 'TODO',
    priority: 'MEDIUM',
    sprintId: 24,
    sprintName: 'Sprint 5',
    responsibleId: '22',
    assignedDevId: '22',
    responsible: 'Guillermo Sainz',
    responsibleName: 'Guillermo Sainz',
    estimatedHours: 4,
    actualHours: null,
    startDate: '2026-06-09',
    dueDate: '2026-06-12',
    createdAt: '2026-06-09T12:00:00Z',
    updatedAt: '2026-06-09T12:00:00Z',
  },
];

export const SPRINTS = [
  {
    sprintId: 24,
    id: 24,
    name: 'Sprint 5',
    sprintName: 'Sprint 5',
    startDate: '2026-06-02',
    endDate: '2026-06-12',
    status: 'ACTIVE',
  },
  {
    sprintId: 23,
    id: 23,
    name: 'Sprint 4',
    sprintName: 'Sprint 4',
    startDate: '2026-05-20',
    endDate: '2026-06-01',
    status: 'COMPLETED',
  },
];

let taskStore = [...TASKS];
let useModifiedDashboard = false;

export function resetMockState() {
  taskStore = [...TASKS];
  useModifiedDashboard = false;
}

export async function installMockApi(page: Page, role: UserRole = 'manager') {
  const currentUser = role === 'manager' ? USERS.manager : USERS.developer;

  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.toLowerCase();
    const hostname = url.hostname.toLowerCase();
    const method = request.method();

    /**
     * OAuth safety net.
     * Feature tests should not use login, but this prevents accidental real Oracle redirects.
     */
    if (path.includes('/oauth2/authorization/oci')) {
      console.log('MOCK OAUTH ROUTE HIT');

      return route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <!doctype html>
          <html>
            <body>
              <p>Mock Oracle login successful</p>
              <script>
                window.localStorage.setItem('auth_token', '${TEST_TOKEN}');
                window.localStorage.setItem('token', '${TEST_TOKEN}');
                window.localStorage.setItem('access_token', '${TEST_TOKEN}');
                window.location.href = '${FRONTEND_URL}/home';
              </script>
            </body>
          </html>
        `,
      });
    }

    /**
     * Safety net: never hit real Oracle Identity during E2E.
     */
    if (hostname.includes('identity.oraclecloud.com')) {
      return route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>Mocked Oracle Identity Provider</body></html>',
      });
    }

    /**
     * Important:
     * Do not mock frontend routes such as /home, /tasks, /timeline.
     * Only mock backend/API requests.
     */
    if (!shouldMockBackendRequest(url)) {
      return route.continue();
    }

    console.log(`MOCK BACKEND ${method} ${url.href}`);

    const authResponse = {
      ...currentUser,
      user: currentUser,
      authenticated: true,
      token: TEST_TOKEN,
      accessToken: TEST_TOKEN,
    };

    /**
     * Auth / current user.
     */
    if (isCurrentUserPath(path)) {
      return fulfillJson(route, authResponse);
    }

    /**
     * Semantic search.
     * Must be before generic /tasks because path contains /tasks.
     */
    if (path.includes('/ai/tasks/semantic-search')) {
      return fulfillJson(route, [
        {
          taskId: 132,
          title: 'Unit, component and security testing',
          description: 'Designed testing plan to test our code',
          status: 'DONE',
          priority: 'HIGH',
          sprintId: 24,
          responsibleId: 22,
          responsibleName: 'Guillermo Sainz',
          distance: 0.286,
          contentPreview: 'Task ID: 132\nTitle: Unit, component and security testing',
        },
        {
          taskId: 69,
          title: 'RBAC system admin',
          description: 'Security architecture',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          sprintId: 24,
          responsibleId: 21,
          responsibleName: 'Juan Villalobos',
          distance: 0.348,
          contentPreview: 'Task ID: 69\nTitle: RBAC system admin',
        },
      ]);
    }

    /**
     * Timeline-specific endpoint, in case the page ever calls /timeline directly.
     */
    if (path.includes('/timeline') && method === 'GET') {
      const timelineTasks = taskStore.map(toFrontendTask);
      console.log(`MOCK TIMELINE GET returning ${timelineTasks.length} tasks`);
      return fulfillJson(route, timelineTasks);
    }

    /**
     * Dashboard analytics.
     */
    if (path.includes('/dashboard/pending-actions')) {
      return fulfillJson(route, [
        {
          id: '69',
          title: 'RBAC system admin',
          responsible: 'Juan Villalobos',
          message: 'Task is in progress.',
          action: 'Update',
        },
        {
          id: '71',
          title: 'Sprint 2 Testing Fundamentals',
          responsible: 'Guillermo Sainz',
          message: 'Waiting for review.',
          action: 'Review',
        },
      ]);
    }

    if (path.includes('/dashboard/stats')) {
      if (useModifiedDashboard) {
        return fulfillJson(route, {
          completed: 99,
          updated: 12,
          created: 9,
          dueSoon: 5,
          dueNext7: 5,
        });
      }

      return fulfillJson(route, {
        completed: 1,
        updated: 2,
        created: 4,
        dueSoon: 2,
        dueNext7: 2,
      });
    }

    if (path.includes('/dashboard/activity')) {
      return fulfillJson(route, [
        {
          id: 'act-1',
          date: 'Friday, June 12, 2026',
          actor: 'Guillermo Sainz',
          action: 'Task Unit, component and security testing',
          status: 'DONE',
          time: '2 hours ago',
        },
        {
          id: 'act-2',
          date: 'Thursday, June 11, 2026',
          actor: 'Juan Villalobos',
          action: 'Task RBAC system admin',
          status: 'IN_PROGRESS',
          time: '1 day ago',
        },
      ]);
    }

    if (path.includes('/dashboard/task-status')) {
      if (useModifiedDashboard) {
        return fulfillJson(route, [
          {
            developer: 'Guillermo Sainz',
            userId: '22',
            todo: 5,
            inProgress: 12,
            inReview: 9,
            blocked: 0,
            done: 99,
          },
          {
            developer: 'Juan Villalobos',
            userId: '21',
            todo: 2,
            inProgress: 4,
            inReview: 1,
            blocked: 0,
            done: 7,
          },
        ]);
      }

      return fulfillJson(route, [
        {
          developer: 'Guillermo Sainz',
          userId: '22',
          todo: 1,
          inProgress: 0,
          inReview: 1,
          blocked: 0,
          done: 1,
        },
        {
          developer: 'Juan Villalobos',
          userId: '21',
          todo: 0,
          inProgress: 1,
          inReview: 0,
          blocked: 0,
          done: 0,
        },
      ]);
    }

    if (path.includes('/dashboard/workload')) {
      if (useModifiedDashboard) {
        return fulfillJson(route, [
          {
            name: 'Guillermo Sainz',
            pct: 89,
            userId: '22',
            assignedTasks: 99,
            completedTasks: 88,
            workloadPercentage: 89,
          },
          {
            name: 'Juan Villalobos',
            pct: 58,
            userId: '21',
            assignedTasks: 12,
            completedTasks: 7,
            workloadPercentage: 58,
          },
        ]);
      }

      return fulfillJson(route, [
        {
          name: 'Guillermo Sainz',
          pct: 75,
          userId: '22',
          assignedTasks: 3,
          completedTasks: 1,
          workloadPercentage: 75,
        },
        {
          name: 'Juan Villalobos',
          pct: 25,
          userId: '21',
          assignedTasks: 1,
          completedTasks: 0,
          workloadPercentage: 25,
        },
      ]);
    }

    if (path.includes('/dashboard/kpis/hours-per-sprint')) {
      return fulfillJson(route, [
        {
          DEVELOPER_NAME: 'Guillermo Sainz',
          developer_name: 'Guillermo Sainz',
          SPRINT_NAME: 'Sprint 5',
          sprint_name: 'Sprint 5',
          TOTAL_HOURS_WORKED: 9,
          total_hours_worked: 9,
        },
        {
          DEVELOPER_NAME: 'Juan Villalobos',
          developer_name: 'Juan Villalobos',
          SPRINT_NAME: 'Sprint 5',
          sprint_name: 'Sprint 5',
          TOTAL_HOURS_WORKED: 2,
          total_hours_worked: 2,
        },
      ]);
    }

    if (path.includes('/dashboard/kpis/tasks-per-sprint')) {
      return fulfillJson(route, [
        {
          SPRINT_NAME: 'Sprint 5',
          sprint_name: 'Sprint 5',
          TASKS_COMPLETED: 1,
          tasks_completed: 1,
        },
        {
          SPRINT_NAME: 'Sprint 4',
          sprint_name: 'Sprint 4',
          TASKS_COMPLETED: 3,
          tasks_completed: 3,
        },
      ]);
    }

    if (path.includes('/dashboard/velocity')) {
      return fulfillJson(route, [
        {
          iteration: 5,
          estimated: 20,
          actual: 11,
        },
        {
          iteration: 4,
          estimated: 30,
          actual: 28,
        },
      ]);
    }

    if (path.includes('/dashboard/hours')) {
      return fulfillJson(route, [
        {
          developer: 'Guillermo Sainz',
          estimated: 15,
          actual: 9,
        },
        {
          developer: 'Juan Villalobos',
          estimated: 5,
          actual: 2,
        },
      ]);
    }

    if (path.includes('/dashboard/cost')) {
      return fulfillJson(route, [
        {
          developer: 'Guillermo Sainz',
          'Sprint 5': 216.36,
        },
        {
          developer: 'Juan Villalobos',
          'Sprint 5': 48.08,
        },
      ]);
    }

    if (path.includes('/dashboard')) {
      return fulfillJson(route, {
        completed: 1,
        updated: 2,
        created: 4,
        dueSoon: 2,
        totalTasks: taskStore.length,
        completedTasks: taskStore.filter((task) => task.status === 'DONE').length,
        inProgressTasks: taskStore.filter((task) => task.status === 'IN_PROGRESS').length,
        inReviewTasks: taskStore.filter((task) => task.status === 'IN_REVIEW').length,
        todoTasks: taskStore.filter((task) => task.status === 'TODO').length,
        overdueTasks: 0,
      });
    }

    /**
     * Users.
     */
    if (path.includes('/users') || path.includes('/user')) {
      if (
        path.includes('/me') ||
        path.includes('/profile') ||
        path.includes('/current') ||
        path.includes('/session')
      ) {
        return fulfillJson(route, authResponse);
      }

      return fulfillJson(route, [USERS.manager, USERS.developer]);
    }

    /**
     * Tasks.
     * This is the important block for TimelinePage.
     * It must return a raw array, not { data: [...] }.
     */
    if (isTasksCollectionPath(path) && method === 'GET') {
      const tasks = taskStore.map(toFrontendTask);
      console.log(`MOCK TASKS GET returning ${tasks.length} tasks`);
      return fulfillJson(route, tasks);
    }

    if (path.includes('/tasks/') && path.endsWith('/complete') && method === 'PATCH') {
      const idFromUrl = getTaskIdFromPath(path);

      taskStore = taskStore.map((task) =>
        String(task.taskId) === idFromUrl || String(task.id) === idFromUrl
          ? {
              ...task,
              status: 'DONE',
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : task
      );

      const updated = taskStore.find(
        (task) => String(task.taskId) === idFromUrl || String(task.id) === idFromUrl
      );

      return fulfillJson(route, toFrontendTask(updated ?? taskStore[0]));
    }

    if (path.includes('/tasks/') && path.endsWith('/status') && method === 'PATCH') {
      const body = await safeJson(request);
      const segments = path.split('/').filter(Boolean);
      const idFromUrl = segments[segments.length - 2];

      taskStore = taskStore.map((task) =>
        String(task.taskId) === idFromUrl || String(task.id) === idFromUrl
          ? {
              ...task,
              status: normalizeStatus(body.status),
              updatedAt: new Date().toISOString(),
            }
          : task
      );

      const updated = taskStore.find(
        (task) => String(task.taskId) === idFromUrl || String(task.id) === idFromUrl
      );

      return fulfillJson(route, toFrontendTask(updated ?? taskStore[0]));
    }

    if (isTasksCollectionPath(path) && method === 'POST') {
      const body = await safeJson(request);

      const newTask = {
        taskId: 900 + taskStore.length,
        id: String(900 + taskStore.length),
        title: body.title ?? 'Playwright E2E task',
        description: body.description ?? 'Created by Playwright mock API',
        status: normalizeStatus(body.status ?? 'TODO'),
        priority: normalizePriority(body.priority ?? 'MEDIUM'),
        sprintId: 24,
        sprintName: 'Sprint 5',
        responsibleId: String(body.responsibleId ?? body.assignedDevId ?? currentUser.userId),
        assignedDevId: String(body.assignedDevId ?? body.responsibleId ?? currentUser.userId),
        responsible: currentUser.name,
        responsibleName: currentUser.name,
        estimatedHours: Number(body.estimatedHours ?? 2),
        actualHours: body.actualHours == null ? null : Number(body.actualHours),
        startDate: body.startDate ?? '2026-06-10',
        dueDate: body.dueDate ?? '2026-06-12',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      taskStore = [newTask, ...taskStore];

      return fulfillJson(route, toFrontendTask(newTask), 201);
    }

    if (path.includes('/tasks/') && ['PUT', 'PATCH'].includes(method)) {
      const body = await safeJson(request);
      const idFromUrl = getTaskIdFromPath(path);

      taskStore = taskStore.map((task) =>
        String(task.taskId) === idFromUrl || String(task.id) === idFromUrl
          ? {
              ...task,
              ...body,
              status: body.status ? normalizeStatus(body.status) : task.status,
              priority: body.priority ? normalizePriority(body.priority) : task.priority,
              updatedAt: new Date().toISOString(),
            }
          : task
      );

      const updated = taskStore.find(
        (task) => String(task.taskId) === idFromUrl || String(task.id) === idFromUrl
      );

      return fulfillJson(route, toFrontendTask(updated ?? taskStore[0]));
    }

    if (path.includes('/tasks/') && method === 'DELETE') {
      const idFromUrl = getTaskIdFromPath(path);

      taskStore = taskStore.filter(
        (task) => String(task.taskId) !== idFromUrl && String(task.id) !== idFromUrl
      );

      return fulfillJson(route, { deleted: true, taskId: idFromUrl });
    }

    /**
     * Sprints.
     */
    if (path.includes('/sprints')) {
      return fulfillJson(route, SPRINTS);
    }

    /**
     * Teams.
     */
    if (path.includes('/teams')) {
      return fulfillJson(route, [
        {
          id: '1',
          teamId: '1',
          name: 'EasyMoneySnipers',
          memberCount: 2,
        },
      ]);
    }

    /**
     * Roles.
     */
    if (path.includes('/roles')) {
      return fulfillJson(route, [
        {
          roleId: 1,
          id: 1,
          name: 'MANAGER',
          description: 'Manager role',
        },
        {
          roleId: 2,
          id: 2,
          name: 'DEVELOPER',
          description: 'Developer role',
        },
      ]);
    }

    /**
     * Permissions.
     */
    if (path.includes('/permissions')) {
      return fulfillJson(route, [
        {
          permissionId: 1,
          id: 1,
          name: 'VIEW_DASHBOARD',
          action: 'READ',
          targetEntity: 'DASHBOARD',
        },
        {
          permissionId: 2,
          id: 2,
          name: 'MANAGE_TASKS',
          action: 'WRITE',
          targetEntity: 'TASK',
        },
      ]);
    }

    /**
     * Summary jobs / AI summaries.
     */
    if (path.includes('/summary-jobs') || path.includes('/summaries')) {
      return fulfillJson(route, [
        {
          summaryJobId: 1,
          id: 1,
          status: 'COMPLETED',
          createdAt: '2026-06-12T12:00:00Z',
          title: 'Sprint 5 summary',
          generatedSummary: 'Mocked sprint summary for Playwright E2E tests.',
        },
      ]);
    }

    /**
     * Fallback.
     * Keeps tests from hitting the real backend accidentally.
     */
    return fulfillJson(route, {
      mocked: true,
      path,
      method,
      warning: 'Unhandled backend mock route',
    });
  });
}

function shouldMockBackendRequest(url: URL) {
  const path = url.pathname.toLowerCase();
  const hostname = url.hostname.toLowerCase();
  const port = url.port;

  /**
   * Old/default backend host used by constants.ts.
   */
  if (hostname === '163.192.136.37') {
    return true;
  }

  /**
   * Local backend.
   */
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && port === '8080') {
    return true;
  }

  /**
   * Relative/proxied API routes only.
   * Do not include /timeline, /tasks, /home, etc. here,
   * because those may be frontend routes on localhost:3000.
   */
  if (path.startsWith('/api/')) {
    return true;
  }

  return false;
}

function isCurrentUserPath(path: string) {
  return (
    path.includes('/auth') ||
    path.includes('/me') ||
    path.includes('/profile') ||
    path.includes('/current-user') ||
    path.includes('/currentuser') ||
    path.includes('/session')
  );
}

function isTasksCollectionPath(path: string) {
  return path.endsWith('/tasks') || path.endsWith('/api/tasks');
}

function getTaskIdFromPath(path: string) {
  const segments = path.split('/').filter(Boolean);
  const tasksIndex = segments.lastIndexOf('tasks');

  if (tasksIndex >= 0 && segments[tasksIndex + 1]) {
    return segments[tasksIndex + 1];
  }

  return segments[segments.length - 1];
}

function normalizeStatus(value: unknown) {
  const status = String(value ?? 'TODO').toUpperCase();

  if (['TODO', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'DONE'].includes(status)) {
    return status;
  }

  if (status === 'TESTING') {
    return 'IN_REVIEW';
  }

  if (status === 'COMPLETED') {
    return 'DONE';
  }

  return 'TODO';
}

function normalizePriority(value: unknown) {
  const priority = String(value ?? 'MEDIUM').toUpperCase();

  if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority)) {
    return priority;
  }

  return 'MEDIUM';
}

function toFrontendTask(task: any) {
  const responsible =
    task?.responsible ??
    task?.responsibleName ??
    task?.username ??
    'Unassigned';

  const id = String(task?.id ?? task?.taskId ?? '');

  return {
    ...task,

    /**
     * Required by TimelinePage and TasksPage.
     */
    id,
    taskId: Number(task?.taskId ?? task?.id ?? 0),
    title: String(task?.title ?? 'Untitled task'),
    description: String(task?.description ?? ''),
    responsible,
    responsibleName: responsible,
    assignedDevId: String(task?.assignedDevId ?? task?.responsibleId ?? ''),

    /**
     * Required by TimelinePage.
     */
    startDate: task?.startDate ?? '2026-06-02',
    dueDate: task?.dueDate ?? '2026-06-12',

    /**
     * Compatible values with frontend types.
     */
    status: normalizeStatus(task?.status),
    priority: normalizePriority(task?.priority),

    createdAt: task?.createdAt ?? '2026-06-02T12:00:00Z',
    updatedAt: task?.updatedAt ?? '2026-06-09T12:00:00Z',
    completedAt: task?.completedAt,
    estimatedHours: task?.estimatedHours == null ? undefined : Number(task.estimatedHours),
    actualHours: task?.actualHours == null ? undefined : Number(task.actualHours),

    sprint: task?.sprint ?? {
      sprintId: task?.sprintId ?? 24,
      sprintName: task?.sprintName ?? 'Sprint 5',
      startDate: '2026-06-02',
      endDate: '2026-06-12',
    },
  };
}

/**
 * Enables modified dashboard responses.
 * Accepts an optional page argument for backwards compatibility.
 */
export async function installDashboardModifiedResponse(_page?: Page) {
  useModifiedDashboard = true;
}

async function safeJson(request: { postDataJSON: () => any }) {
  try {
    return request.postDataJSON();
  } catch {
    return {};
  }
}

async function fulfillJson(route: Route, json: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'access-control-allow-origin': '*',
    },
    json,
  });
}