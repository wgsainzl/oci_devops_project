import { expect, Page } from '@playwright/test';

export class AppPage {
  constructor(private readonly page: Page) {}

  async gotoHome() {
    await this.page.goto('/');
  }

  async gotoLogin() {
    await this.page.goto('/login');
  }

  async openTasks() {
    await this.page.getByRole('link', { name: /tasks|tareas/i }).click();
  }

  async openDashboard() {
    await this.page.getByRole('link', { name: /dashboard|home|inicio/i }).click();
  }

  async searchTask(text: string) {
    const searchBox = this.page.getByPlaceholder(/search|buscar/i);
    await searchBox.fill(text);
  }

  async expectTaskVisible(title: string | RegExp) {
    await expect(this.page.getByText(title)).toBeVisible();
  }

  async createTask(data: {
    title: string;
    description: string;
    priority: string;
  }) {
    await this.page.getByRole('button', { name: /create|new|add|crear|nueva/i }).click();

    await this.page.getByLabel(/title|título/i).fill(data.title);
    await this.page.getByLabel(/description|descripción/i).fill(data.description);

    await this.page.getByRole('combobox', { name: /priority|prioridad/i }).selectOption({
      label: data.priority,
    }).catch(async () => {
      await this.page.getByText(data.priority, { exact: true }).click();
    });

    await this.page.getByRole('button', { name: /save|create|guardar|crear/i }).click();
  }
}