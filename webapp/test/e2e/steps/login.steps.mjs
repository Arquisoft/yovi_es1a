import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';

Given('the login page is open', async function () {
  await this.page.goto('http://localhost:5173/login');
});

Given('a user exists with username {string}, email {string} and password {string}', async function (username, gmail, password) {
  await this.page.goto('http://localhost:5173/register');

  await this.page.fill('#username', username);
  await this.page.fill('#email', gmail);
  await this.page.fill('#password', password);
  await this.page.click('button[type="submit"]');

  await this.page.waitForTimeout(1000); 
  await this.page.screenshot({ path: 'debug-registro.png', fullPage: true });
});

When('I fill in valid credentials and submit', async function () {
  await this.page.fill('#username', 'adriangg');
  await this.page.fill('#password', '1234');
  await this.page.click('button[type="submit"]');

});

Then('I should be redirected to the configureGame page', async function () {
  await this.page.waitForURL('**/configureGame', { timeout: 10000 });
  
  const currentUrl = this.page.url();
  assert.ok(
    currentUrl.includes('/configureGame'), 
    `Se esperaba redirigir a /configureGame, pero la URL es ${currentUrl}`
  );
});

When('I fill in invalid credentials and submit', async function () {
  await this.page.fill('#username', 'usuario_falso_inventado');
  await this.page.fill('#password', 'clave_incorrecta');
  await this.page.click('button[type="submit"]');
});

Then('I should see an error message for incorrect credentials on the screen', async function () {
  const errorMessage = await this.page.waitForSelector('.error-message', { 
    timeout: 10000,
    state: 'visible' 
  });
  
  const text = await errorMessage.textContent();
  assert.ok(
    text.length > 0,"No se encontró ningún texto de error en la pantalla"
  );

  assert.strictEqual(
    text, 
    "User not found", `Hay texto, pero es incorrecto. Esperábamos "User not found" pero la web mostró "${text}".`
  );
});

When('I leave the credentials empty and submit', async function () {
  await this.page.fill('#username', '');
  await this.page.fill('#password', '');
  await this.page.click('button[type="submit"]');
});

Then('I should see an error message for empty credentials on the screen', async function () {
  const errorMessage = await this.page.waitForSelector('.error-message', { 
    timeout: 10000,
    state: 'visible' 
  });
  
  const text = await errorMessage.textContent();
  assert.ok(
    text.length > 0,"No se encontró ningún texto de error en la pantalla"
  );

  assert.strictEqual(
    text, 
    "Please enter username and password", `Hay texto, pero es incorrecto. Esperábamos "Please enter username and password" pero la web mostró "${text}".`
  );
});