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
  const modeSelect = this.page
    .locator('.control-group')
    .filter({ hasText: /Modo de Juego/i })
    .locator('select');
  await modeSelect.waitFor({ state: 'visible' });
  await modeSelect.selectOption({ label: modeText });
});

When('I set the board size to {string}', async function (size) {
  const slider = this.page.locator('.control-input-range');
  await slider.waitFor({ state: 'visible' });
  await slider.fill(size);
});

When('I select the difficulty {string}', async function (difficultyText) {
  const diffSelect = this.page
    .locator('.control-group')
    .filter({ hasText: /Nivel de Dificultad/i })
    .locator('select');
  await diffSelect.waitFor({ state: 'visible' });
  await diffSelect.selectOption({ label: difficultyText });
});

When('I select the opponent {string}', async function (opponentText) {
  const botSelect = this.page
    .locator('.control-group')
    .filter({ hasText: /Elige tu oponente/i })
    .locator('select');
  await this.page.waitForSelector(`option:has-text("${opponentText}")`, {
    state: 'attached',
    timeout: 5000
  });
  await botSelect.selectOption({ label: opponentText });
});

When('I select the starting player {string}', async function (playerText) {
  const startSelect = this.page
    .locator('.control-group')
    .filter({ hasText: /¿Quién empieza la partida\?/i })
    .locator('select');
  await startSelect.waitFor({ state: 'visible' });
  await startSelect.selectOption({ label: playerText });
  await this.page.waitForTimeout(300);
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
