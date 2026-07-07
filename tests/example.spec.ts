import { test, expect } from '@playwright/test';
import { testConfig } from '../src/config/testConfig';
import { MainPage } from '../src/pages/MainPage';

test.describe('Playwright docs search', () => {
  test('opens main page and prints search result titles', async ({ page }) => {
    const mainPage = new MainPage(page);

    await mainPage.goto();
    await mainPage.expectLoaded();
    await mainPage.search.expectVisible();
    await mainPage.search.search(testConfig.search.defaultQuery);

    const resultTitles = await mainPage.search.getResultTitles();
    console.log(`Search result titles for "${testConfig.search.defaultQuery}":`);
    console.log(resultTitles.map((title, index) => `${index + 1}. ${title}`).join('\n'));

    expect(resultTitles.length).toBeGreaterThan(0);
  });
});
