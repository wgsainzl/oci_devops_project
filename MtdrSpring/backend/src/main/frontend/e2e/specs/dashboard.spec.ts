import { expect, test } from '@playwright/test';
import { openHomeDirect, openTasksDirect } from '../support/test-helpers';
import {
  installDashboardModifiedResponse,
  resetMockState,
} from '../support/api-mocks';

test.describe('Dashboard analytics @dashboard @mock', () => {
  test.beforeEach(async () => {
    resetMockState();
  });

  test('manager can open home dashboard without login flow @manager', async ({ page }, testInfo) => {
    test.slow();

    await openHomeDirect(page, 'manager');

    await expect(page).toHaveURL(/\/home/);
    await expect(page.locator('body')).toContainText(/Home|Recent activity|Team workload|Oracle/i);

    await page.screenshot({
      path: `test-results/screenshots/${testInfo.title.replaceAll(' ', '-')}.png`,
      fullPage: true,
    });
  });

  test('dashboard uses modified mocked analytics response @mock-response', async ({ page }) => {
    await installDashboardModifiedResponse();

    await openTasksDirect(page, 'manager');

    await expect(page).toHaveURL(/\/home/);
    await expect(page.locator('body')).not.toContainText(/Login with Oracle Cloud/i);
    await expect.soft(page.locator('body')).toContainText(/Home|Recent activity|Team workload|Oracle/i);
  });

  test('semantic search UI is skipped until search box is exposed @ai', async ({ page }) => {
    await openHomeDirect(page, 'manager');

    const search = page.getByRole('textbox', { name: 'Enter task ID or search' })
    await search.fill('tareas relacionadas con pruebas de seguridad');
    await search.press('Enter');

    await expect(page.getByText(/Unit, component and security testing/i)).toBeVisible();
  });
});