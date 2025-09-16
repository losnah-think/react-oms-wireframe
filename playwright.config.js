/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  use: {
    headless: true,
    baseURL: 'http://localhost:3000',
    actionTimeout: 10000,
    navigationTimeout: 20000
  },
  testDir: 'tests/e2e',
  reporter: [['list'], ['html', { open: 'never' }]],
};