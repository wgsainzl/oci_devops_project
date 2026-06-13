import { expect, Page } from '@playwright/test';
import { installMockApi, TEST_TOKEN, UserRole, USERS } from './api-mocks';

export async function installLoggedInState(page: Page, role: UserRole = 'manager') {
  await installMockApi(page, role);

  await page.addInitScript((token) => {
    window.localStorage.setItem('auth_token', token);
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('access_token', token);
  }, TEST_TOKEN);
}

export async function installLoggedOutState(page: Page) {
  await installMockApi(page, 'manager');

  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

export async function getStoredToken(page: Page) {
  return page.evaluate(() => {
    return (
      window.localStorage.getItem('auth_token') ||
      window.localStorage.getItem('token') ||
      window.localStorage.getItem('access_token') ||
      window.localStorage.getItem('jwt') ||
      window.localStorage.getItem('authToken')
    );
  });
}

export async function loginWithMockSession(page: Page, role: UserRole = 'manager') {
  await installLoggedInState(page, role);
}

export async function clearSession(page: Page) {
  await installLoggedOutState(page);
}

export async function installE2EState(page: Page, role: UserRole = 'manager') {
  const currentUser = role === 'manager' ? USERS.manager : USERS.developer;

  await installMockApi(page, role);

  await page.addInitScript(({ token, user }) => {
    window.localStorage.setItem('auth_token', token);
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('access_token', token);

    window.localStorage.setItem('user', JSON.stringify(user));
    window.localStorage.setItem('currentUser', JSON.stringify(user));
    window.localStorage.setItem('auth_user', JSON.stringify(user));
    window.localStorage.setItem('isAuthenticated', 'true');
  }, { token: TEST_TOKEN, user: currentUser });
}

export async function openHomeDirect(page: Page, role: UserRole = 'manager') {
  await installE2EState(page, role);

  await page.goto('/home');

  await expect(page.locator('body')).not.toContainText(/Sign in to Oracle/i);
  await expect(page.locator('body')).not.toContainText(/Login with Oracle Cloud/i);
}

export async function openTasksDirect(page: Page, role: UserRole = 'manager') {
  await installE2EState(page, role);

  await page.goto('/tasks');
}