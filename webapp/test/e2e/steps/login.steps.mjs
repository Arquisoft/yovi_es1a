import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';

Given('the login page is open', async function () {
    await this.page.goto('http://localhost:5173/login');
    await this.page.waitForSelector('form', { state: 'visible' });
});

Given('a user exists with username {string}, email {string} and password {string}', async function (username, email, password) {
    this.testUser = { username, password };
    
    const response = await fetch('http://localhost:3000/createuser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });

    if (!response.ok) {
        const data = await response.json();
        const isConflict = data.error && (data.error.includes('already') || data.error.includes('registrado'));
        if (!isConflict) {
            throw new Error(`Error fatal en setup: ${data.error}`);
        }
    }
});

When('I fill in valid credentials and submit', async function () {
    const { username, password } = this.testUser;
    await this.page.fill('#username', username);
    await this.page.fill('#password', password);
    await this.page.click('button[type="submit"]');
});

When('I fill in the username {string} and password {string}', async function (user, pass) {
    await this.page.fill('#username', user);
    await this.page.fill('#password', pass);
});

When('I submit the login form', async function () {
    await this.page.click('button[type="submit"]');
});

When('I submit the login form without filling any data', async function () {
    await this.page.fill('#username', '');
    await this.page.fill('#password', '');
    await this.page.click('button[type="submit"]');
});

Then('I should be redirected to the configureGame page', async function () {
    await this.page.waitForURL('**/configureGame', { timeout: 10000 });
    const url = this.page.url();
    assert.ok(url.includes('/configureGame'), `URL actual incorrecta: ${url}`);
});

Then('I should see an error message for incorrect credentials on the screen', async function () {
    const errorMsg = await this.page.waitForSelector('[class*="error"]', { state: 'visible' });
    const text = (await errorMsg.textContent()).toLowerCase();
    
    const matches = text.includes('incorrecto') || text.includes('invalid') || text.includes('error');
    assert.ok(matches, `Mensaje de error inesperado: ${text}`);
});

Then('I should see an error message for empty credentials on the screen', async function () {
    const errorMsg = await this.page.waitForSelector('[class*="error"]', { state: 'visible' });
    const text = await errorMsg.textContent();
    
    assert.ok(text.length > 5, "El mensaje de error debería ser descriptivo");
});