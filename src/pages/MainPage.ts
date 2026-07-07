import { expect, type Locator, type Page } from '@playwright/test';
import { SearchComponent } from '../components/SearchComponent';
import { BasePage } from './BasePage';

export class MainPage extends BasePage {
  readonly heading: Locator;
  readonly navigation: Locator;
  readonly search: SearchComponent;

  constructor(page: Page) {
    super(page, '/');
    this.heading = page.getByRole('heading', { level: 1 });
    this.navigation = page.getByRole('navigation');
    this.search = new SearchComponent(page);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.navigation).toBeVisible();
  }
}
