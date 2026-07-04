// page object model for the example test
import { test, expect } from '@playwright/test';

export class ExamplePage {
    constructor(page) {
        this.page = page;
        this.exampleElement = page.locator('#example-element');
    }
    async clickExampleButton() {
        await this.exampleElement.click();
    }
    async getExampleText() {
        return await this.exampleElement.textContent();
    }
}
test('example test', async ({ page }) => {
    const examplePage = new ExamplePage(page);
    await page.goto('/');

    // Add your example tests here
    await examplePage.clickExampleButton();
    const text = await examplePage.getExampleText();
    expect(text).toBe('Expected Text');
});

// ^ so this was fully generated with AI autocomplete, but I added the last line to explain what happened.
// also it did autocompleted the above sentence after the comma.

