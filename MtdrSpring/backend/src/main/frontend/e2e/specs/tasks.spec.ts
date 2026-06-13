import { expect, test } from '@playwright/test';
import { openHomeDirect, installE2EState } from '../support/test-helpers';
import { resetMockState } from '../support/api-mocks';

test.describe('Task management @tasks @mock', () => {
  test.beforeEach(async () => {
    resetMockState();
  });

  test('developer can open tasks page without login flow', async ({ page }) => {
    await installE2EState(page, 'developer');

    await page.goto('/tasks');

    await expect(page.locator('body')).not.toContainText(/Login with Oracle Cloud/i);
    await expect(page.locator('body')).toContainText(/Tasks|Task|Unit, component and security testing|RBAC/i);
  });

  test('home dashboard shows task-related information', async ({ page }) => {
    await openHomeDirect(page, 'developer');

    await expect(page.locator('body')).not.toContainText(/Sign in to Oracle/i);
    await expect.soft(page.locator('body')).toContainText(/Recent activity|Task|Team workload|Oracle/i);
  });

  const taskTitles = [
    'Unit, component and security testing',
    'RBAC system admin',
    'Sprint 2 Testing Fundamentals',
  ];

  for (const title of taskTitles) {
    test(`mocked task is visible or available in mocked data: ${title} @parameterized`, async ({ page }) => {
      await installE2EState(page, 'developer');

      await page.goto('/tasks');

      await expect(page.locator('body')).not.toContainText(/Login with Oracle Cloud/i);
      await expect(page.locator('body')).toContainText(new RegExp(title, 'i'));
    });
  }
});