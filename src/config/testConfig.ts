export const testConfig = {
  targetUrl: process.env.BASE_URL ?? 'https://playwright.dev/',
  search: {
    defaultQuery: 'await',
    resultsTimeoutMs: 10_000
  }
} as const;
