import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';

Given('the login page is open', async function () {
  await this.page.goto('http://localhost:5173/login');
});

When('I fill in valid credentials and submit', async function () {
const dialogPromise = this.page.waitForEvent('dialog');

  await this.page.fill('#username', 'jivan');
  await this.page.fill('#password', '1234');
  await this.page.click('button[type="submit"]');

  const dialog = await dialogPromise;
  await dialog.accept();
});

Then('I should be redirected to the botTester page', async function () {
  await this.page.waitForURL('**/botTester', { timeout: 10000 });
  
  const currentUrl = this.page.url();
  assert.ok(
    currentUrl.includes('/botTester'), 
    `Se esperaba redirigir a /botTester, pero la URL es ${currentUrl}`
  );
});

When('I fill in invalid credentials and submit', async function () {
  await this.page.fill('#username', 'usuario_falso_inventado');
  await this.page.fill('#password', 'clave_incorrecta');
  await this.page.click('button[type="submit"]');
});

Then('I should see an error message on the screen', async function () {
  const errorMessage = await this.page.waitForSelector('.error-message', { 
    timeout: 10000,
    state: 'visible' 
  });
  
  const text = await errorMessage.textContent();
  assert.ok(text.length > 0, "No se encontró ningún texto de error en la pantalla");
});