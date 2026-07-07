import { expect, type Locator, type Page } from '@playwright/test';

export class SearchComponent {
  readonly root: Locator;
  readonly input: Locator;
  readonly submitButton: Locator;
  readonly results: Locator;

  constructor(page: Page, root: Locator = page.getByTestId('search')) {
    this.root = root;
    this.input = this.root.getByRole('searchbox').or(this.root.getByPlaceholder(/search/i));
    this.submitButton = this.root.getByRole('button', { name: /search/i });
    this.results = page.getByTestId('search-results').getByRole('listitem');
  }

  async search(query: string): Promise<void> {
    await this.input.fill(query);
    await this.submitButton.click();
  }

  async expectVisible(): Promise<void> {
    await expect(this.root).toBeVisible();
  }

  async expectResultContains(text: string | RegExp): Promise<void> {
    await expect(this.results.filter({ hasText: text }).first()).toBeVisible();
  }
}
