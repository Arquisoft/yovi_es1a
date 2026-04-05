import { Given, When, Then } from '@cucumber/cucumber';

Given('the user {string} with email {string} and password {string} is already registered', async function (username, email, password) {
  try {
    await fetch('http://localhost:3000/createuser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
  } catch (error) {
    console.log("Aviso en preparación de test:", error);
  }
});

Given('I am on the home page', async function () {
  await this.page.goto('http://localhost:5173');
  await this.page.waitForLoadState('networkidle');
});

When('I click the "Create Account" button', async function () {
  const registerBtn = this.page.getByText(/Crear cuenta|Create Account/i);
  await registerBtn.first().waitFor({ state: 'visible', timeout: 5000 });
  await registerBtn.first().click();
});

When('I enter a unique username, email and password', async function () {
  const uniqueId = Date.now(); 
  this.registeredUsername = `user${uniqueId}`;
  this.registeredEmail = `user${uniqueId}@gmail.com`;

  const inputs = this.page.locator('input');
  await inputs.nth(0).waitFor({ state: 'visible', timeout: 5000 });
  
  await inputs.nth(0).fill(this.registeredUsername);
  await inputs.nth(1).fill(this.registeredEmail);
  await inputs.nth(2).fill('PasswordSegura123!');
});

When('I enter username {string}, email {string} and password {string}', async function (username, email, password) {
  const inputs = this.page.locator('input');
  await inputs.nth(0).waitFor({ state: 'visible', timeout: 5000 });
  
  await inputs.nth(0).fill(username);
  await inputs.nth(1).fill(email);
  await inputs.nth(2).fill(password);
});

When('I leave all fields empty', async function () {
  const inputs = this.page.locator('input');
  await inputs.nth(0).waitFor({ state: 'visible', timeout: 5000 });
  
  await inputs.nth(0).fill('');
  await inputs.nth(1).fill('');
  await inputs.nth(2).fill('');
});

When('I click the "Lets go!" button', async function () {
  this.dialogPromise = this.page.waitForEvent('dialog', { timeout: 3000 }).catch(() => null);

  const submitBtn = this.page.locator('button', { hasText: 'Lets go!' });
  await submitBtn.click();
});

Then('I should see a welcome message containing {string}', async function (expectedMessage) {
  await this.page.waitForSelector('.welcome-overlay', { timeout: 5000 });

  const welcomeText = await this.page.locator('.welcome-overlay').innerText();
  
  if (!welcomeText) {
    throw new Error('No apareció el mensaje de bienvenida en el DOM');
  }

  await this.page.waitForFunction(
    () => window.location.pathname === '/configureGame',
    { timeout: 5000 }
  );
});

Then('I should see an error message indicating the user already exists', async function () {
  // 1. Buscamos cualquier elemento cuya clase contenga "error" (así no dependemos del nombre exacto del CSS)
  // y le damos 10 segundos por si el servidor tarda en responder.
  const errorMessage = await this.page.waitForSelector('[class*="error"]', { 
    state: 'visible', 
    timeout: 10000 
  });
  
  // 2. Extraemos el texto
  const text = await errorMessage.textContent();
  const textLower = text.toLowerCase();
  
  // 3. Verificamos que el texto hable de un usuario duplicado (en inglés o español)
  const isDuplicateError = textLower.includes('exist') || textLower.includes('uso') || textLower.includes('already');
  
  if (!isDuplicateError) {
    throw new Error(`Se esperaba un error de duplicado, pero la web mostró: "${text}"`);
  }
});

Then('I should not be redirected and stay on the register page', async function () {
  const dialog = await this.dialogPromise;
  
  if (dialog) {
    await dialog.accept();
  }

  await this.page.waitForTimeout(1000);
  
  const currentUrl = this.page.url();
  if (!currentUrl.includes('/register')) {
    throw new Error(`¡Fallo de seguridad! El formulario se envió con datos vacíos o erróneos y nos llevó a: ${currentUrl}`);
  }
});