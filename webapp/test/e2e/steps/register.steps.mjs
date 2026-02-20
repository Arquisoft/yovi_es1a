import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';

Given('the register page is open', async function () {
  await this.page.goto('http://localhost:5173');
});

When('I enter {string} as the username and submit', async function (username) {
  await this.page.fill('#username', username);
  await this.page.fill('#email', 'test@example.com');     
  await this.page.fill('#password', 'password123');     
  await this.page.click('button[type="submit"]');
});

Then('I should see a welcome message containing {string}', async function (expectedText) {
  const successMessage = await this.page.waitForSelector('.success-message', { 
    timeout: 10000,
    state: 'visible' 
  });
  const text = await successMessage.textContent();
  
  assert.ok(
    text.includes(expectedText), 
    `El texto "${text}" no contiene lo esperado: "${expectedText}"`
  );
});