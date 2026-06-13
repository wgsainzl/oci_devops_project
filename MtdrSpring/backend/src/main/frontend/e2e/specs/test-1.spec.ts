import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://163.192.136.37/home');
  await page.getByText('Guillermo Sainz updated task status to DONE on ORC-235').click();
  await page.locator('div').filter({ hasText: /^81 tasks completedin the last 7 days$/ }).first().click();
  await page.getByText('Diego Rodriguez').click();
  await page.getByText('26%').click();
  await page.locator('g:nth-child(11) > .recharts-dot').click();
  await page.getByRole('textbox', { name: 'Enter task ID or search' }).fill('fix');
  await page.getByRole('textbox', { name: 'Enter task ID or search' }).press('Enter');
  await page.getByRole('cell', { name: 'Revisar y corregir sistemas y' })
});