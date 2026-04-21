import { Given, When, Then } from '@cucumber/cucumber';

Given('I am logged in and on the game configuration page', async function () {
  await this.page.goto('http://localhost:5173');
  
  // Set user in sessionStorage (not localStorage)
  await this.page.evaluate(() => {
    sessionStorage.setItem("user", JSON.stringify({ userId: "12345", username: "JugadorPro" }));
  });
  
  await this.page.goto('http://localhost:5173/configureGame');
  
  // Wait for the select to be in the DOM and rendered
  await this.page.waitForSelector('select', { timeout: 20000 });
  await this.page.waitForFunction(() => {
    const selects = document.querySelectorAll('select');
    if (selects.length === 0) return false;
    // Check if it's actually visible (not just in DOM)
    const rect = selects[0].getBoundingClientRect();
    return rect.height > 0 && rect.width > 0;
  }, { timeout: 20000 });
  
  await this.page.waitForLoadState('networkidle');
});

When('I select the mode {string}', async function (modeText) {
  // First ensure the select exists and is rendered
  await this.page.waitForSelector('.control-group select', { timeout: 15000 });
  
  const selectLocator = this.page.locator('.control-group').first().locator('select');
  
  let valueToSelect = "bot";
  if (modeText.includes("Local") || modeText.includes("2 Jugadores")) {
    valueToSelect = "humano";
  } else if (modeText.includes("Online")) {
    valueToSelect = "online";
  }
  
  await selectLocator.selectOption(valueToSelect);
  await this.page.waitForTimeout(800);
});

When('I select the difficulty {string}', async function (difficultyText) {
  // Wait for the select to appear - it's only visible when modo === "bot"
  await this.page.waitForFunction(() => {
    const groups = document.querySelectorAll('.control-group');
    for (const g of groups) {
      if (/Nivel de Dificultad|nivelDif/i.test(g.textContent)) {
        const select = g.querySelector('select');
        return select !== null;
      }
    }
    return false;
  }, { timeout: 10000 });
  
  const selectLocator = this.page.locator('.control-group').filter({ hasText: /Nivel de Dificultad|nivelDif/i }).locator('select');
  
  let valueToSelect = "facil";
  if (difficultyText === "Intermedio") valueToSelect = "medio";
  if (difficultyText === "Experto") valueToSelect = "dificil";
  
  await selectLocator.selectOption(valueToSelect);
  await this.page.waitForTimeout(500);
});

When('I set the board size to {string}', async function (size) {
    const sizeInput = this.page.locator('input.size-value');
    await sizeInput.fill(size);
    await sizeInput.dispatchEvent('change');
});

When('I select the opponent {string}', async function (botName) {
  // Wait for the opponent select to appear
  await this.page.waitForFunction(() => {
    const groups = document.querySelectorAll('.control-group');
    for (const g of groups) {
      if (/Elige tu oponente|eligeOponente/i.test(g.textContent)) {
        const select = g.querySelector('select');
        return select !== null;
      }
    }
    return false;
  }, { timeout: 10000 });
  
  const selectLocator = this.page.locator('.control-group').filter({ hasText: /Elige tu oponente|eligeOponente/i }).locator('select');
  
  let valueToSelect = "random_bot";
  if (botName === "Monte Carlo") valueToSelect = "monte_carlo_bot";
  if (botName.includes("Ataque en Triángulo")) valueToSelect = "triangle_attack_bot";
  
  await selectLocator.selectOption(valueToSelect);
  await this.page.waitForTimeout(500);
});

When('I select the starting player {string}', async function (playerText) {
  await this.page.waitForFunction(() => {
    const groups = document.querySelectorAll('.control-group');
    for (const g of groups) {
      if (/¿Quién empieza la partida\?|quienEmp/i.test(g.textContent)) {
        const select = g.querySelector('select');
        return select !== null;
      }
    }
    return false;
  }, { timeout: 10000 });
  
  const selectLocator = this.page.locator('.control-group').filter({ hasText: /¿Quién empieza la partida\?|quienEmp/i }).locator('select');
  
  let valueToSelect = "B"; 
  if (playerText.includes("Máquina") || playerText.includes("invitado") || playerText.includes("Rojo")) {
    valueToSelect = "R";
  }
  
  await selectLocator.selectOption(valueToSelect);
  await this.page.waitForTimeout(500);
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
