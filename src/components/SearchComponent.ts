import { expect, type Locator, type Page } from '@playwright/test';

export class SearchComponent {
  readonly root: Locator;
  readonly openButton: Locator;
  readonly input: Locator;
  readonly resultItems: Locator;
  readonly resultTitles: Locator;

  constructor(page: Page, root: Locator = page.locator('xpath=//button[contains(@class, "DocSearch-Button")]')) {
    this.root = root;
    this.openButton = root;
    this.input = page.locator('xpath=//input[@id="docsearch-input" and @type="search"]');
    this.resultItems = page.locator('xpath=//li[contains(@class, "DocSearch-Hit")]');
    this.resultTitles = page.locator(
      'xpath=//li[contains(@class, "DocSearch-Hit")]//*[contains(@class, "DocSearch-Hit-title")]'
    );
  }

  async open(): Promise<void> {
    await this.openButton.click();
    await expect(this.input).toBeVisible();
  }

  async search(query: string): Promise<void> {
    await this.open();
    await this.input.fill(query);
    await expect(this.resultItems.first()).toBeVisible();
  }

  async getResultTitles(): Promise<string[]> {
    await expect(this.resultTitles.first()).toBeVisible();
    const titles = await this.resultTitles.allTextContents();

    return titles.map((title) => title.trim()).filter(Boolean);
  }

  async expectVisible(): Promise<void> {
    await expect(this.openButton).toBeVisible();
  }

  async expectResultContains(text: string | RegExp): Promise<void> {
    await expect(this.resultItems.filter({ hasText: text }).first()).toBeVisible();
  }
}
