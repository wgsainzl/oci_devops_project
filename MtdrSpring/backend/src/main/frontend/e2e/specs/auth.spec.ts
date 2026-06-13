import { expect, test } from '@playwright/test';
import { installLoggedInState, installLoggedOutState, getStoredToken } from '../support/test-helpers';
import { resetMockState, TEST_TOKEN } from '../support/api-mocks';

test.describe('Authentication @auth @mock', () => {
  test.beforeEach(async () => {
    resetMockState();
  });

  test('shows Oracle login screen when user is logged out', async ({ page }) => {
    await installLoggedOutState(page);

    await page.goto('/login');

    await expect(page.getByText(/Sign in to Oracle/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Login with Oracle Cloud/i })).toBeVisible();
  });

  test('mock login button stores token and leaves login page', async ({ page }) => {
    await installLoggedOutState(page);

    await page.goto('/login');

    await page.getByRole('button', { name: /Login with Oracle Cloud/i }).click();

    await expect
      .poll(async () => getStoredToken(page), {
        timeout: 10_000,
      })
      .toBe(TEST_TOKEN);

    await expect(page).not.toHaveURL(/\/login$/);
  });

  test('logged in user does not stay on login page', async ({ page }) => {
    await installLoggedInState(page, 'manager');

    await page.goto('/');

    await expect(page.getByText(/Oracle Task Manager/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Login with Oracle Cloud/i })).not.toBeVisible();
  });
});