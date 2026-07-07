import { expect, type Locator, type Page } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly path: string;

  protected constructor(page: Page, path = '/') {
    this.page = page;
    this.path = path;
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForPageReady();
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async expectUrlContains(value: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(value);
  }

  protected byTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }
}
