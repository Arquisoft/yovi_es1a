import { setWorldConstructor, Before, After, setDefaultTimeout } from '@cucumber/cucumber'
import { chromium } from 'playwright'

setDefaultTimeout(60_000)

class CustomWorld {
  browser = null
  page = null
}

setWorldConstructor(CustomWorld)

Before(async function () {
  // Allow turning off headless mode and enabling slow motion/devtools via env vars
  const headless = true // Cambiar a false para ver el navegador en acción
  const slowMo = 0 // Aumentar a 50 o 100 para ralentizar las acciones y verlas mejor
  const devtools = false // Cambiar a true para abrir con DevTools

  this.browser = await chromium.launch({ headless, slowMo, devtools })
  this.page = await this.browser.newPage()
})

After(async function () {
  if (this.page) await this.page.close()
  if (this.browser) await this.browser.close()
})
