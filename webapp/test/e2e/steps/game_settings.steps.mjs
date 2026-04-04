import { Given, When, Then } from '@cucumber/cucumber';

Given('I am logged in and on the game configuration page', async function () {
  await this.page.goto('http://localhost:5173');
  await this.page.evaluate(() => {
    localStorage.setItem("user", JSON.stringify({ userId: "12345", username: "JugadorPro" }));
  });
  await this.page.goto('http://localhost:5173/configureGame');
  await this.page.waitForLoadState('networkidle');
});

When('I select the mode {string}', async function (modeText) {
  const selectLocator = this.page.locator('.control-group').filter({ hasText: /Modo de Juego/i }).locator('select');
  
  let valueToSelect = "bot";
  if (modeText.includes("Local") || modeText.includes("2 Jugadores")) {
    valueToSelect = "humano";
  } else if (modeText.includes("Online")) {
    valueToSelect = "online";
  }
  
  await selectLocator.selectOption(valueToSelect);
});

When('I select the difficulty {string}', async function (difficultyText) {
  const selectLocator = this.page.locator('.control-group').filter({ hasText: /Nivel de Dificultad/i }).locator('select');
  
  let valueToSelect = "facil";
  if (difficultyText === "Intermedio") valueToSelect = "medio";
  if (difficultyText === "Experto") valueToSelect = "dificil";
  
  await selectLocator.selectOption(valueToSelect);
});

When('I set the board size to {string}', async function (size) {
    const sizeInput = this.page.locator('input.size-value');
    await sizeInput.fill(size);
    await sizeInput.dispatchEvent('change');
});

When('I select the opponent {string}', async function (botName) {
  const selectLocator = this.page.locator('.control-group').filter({ hasText: /Elige tu oponente/i }).locator('select');
  
  let valueToSelect = "random_bot";
  if (botName === "Monte Carlo") valueToSelect = "monte_carlo_bot";
  if (botName.includes("Ataque en Triángulo")) valueToSelect = "triangle_attack_bot";
  
  await selectLocator.selectOption(valueToSelect);
});

When('I select the starting player {string}', async function (playerText) {
  const selectLocator = this.page.locator('.control-group').filter({ hasText: /¿Quién empieza la partida\?/i }).locator('select');
  
  let valueToSelect = "B"; 
  if (playerText.includes("Máquina") || playerText.includes("invitado") || playerText.includes("Rojo")) {
    valueToSelect = "R";
  }
  
  await selectLocator.selectOption(valueToSelect);
});

When('I select {string} as the starting player', async function (playerValue) {
  const startSelect = this.page
    .locator('.control-group')
    .filter({ hasText: /¿Quién empieza la partida\?/i })
    .locator('select');
  await startSelect.waitFor({ state: 'visible' });
  await startSelect.selectOption({ value: playerValue });
  await this.page.waitForTimeout(300);
});

When('I click the play button', async function () {
  await this.page.locator('.btn-jugar-fixed').click();
});

Then('I should be redirected to the game board', async function () {
  await this.page.waitForFunction(
    () => window.location.pathname === '/game',
    { timeout: 5000 }
  );
});

Then('the bot difficulty options should disappear', async function () {
  await this.page.waitForFunction(() => {
    const groups = document.querySelectorAll('.control-group');
    for (const g of groups) {
      if (/Nivel de Dificultad/i.test(g.textContent)) return false;
      if (/Elige tu oponente/i.test(g.textContent)) return false;
    }
    return true;
  }, { timeout: 5000 });
});
