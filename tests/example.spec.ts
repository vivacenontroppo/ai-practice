import { expect, test } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { MainPage } from '../src/pages/MainPage';

test.describe('POM smoke tests', () => {
  test('fills login form with LoginPage', async ({ page }) => {
    await page.setContent(`
      <main>
        <form>
          <label for="username">Username</label>
          <input id="username" />
          <label for="password">Password</label>
          <input id="password" type="password" />
          <button type="button">Log in</button>
        </form>
      </main>
    `);

    const loginPage = new LoginPage(page);
    await loginPage.expectLoginFormVisible();
    await loginPage.login('test.user', 'secret');

    await expect(loginPage.usernameInput).toHaveValue('test.user');
    await expect(loginPage.passwordInput).toHaveValue('secret');
  });

  test('uses MainPage with SearchComponent', async ({ page }) => {
    await page.setContent(`
      <header>
        <nav aria-label="Main navigation">Home</nav>
      </header>
      <main>
        <h1>Dashboard</h1>
        <form data-testid="search" role="search">
          <input type="search" aria-label="Search" />
          <button type="button">Search</button>
        </form>
        <ul data-testid="search-results">
          <li>Playwright TypeScript guide</li>
        </ul>
      </main>
    `);

    const mainPage = new MainPage(page);
    await mainPage.expectLoaded();
    await mainPage.search.expectVisible();
    await mainPage.search.search('playwright');
    await mainPage.search.expectResultContains(/typescript/i);
  });
});
