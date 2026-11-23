// Records the README screenshots and demo video into docs/media/.
// Usage: npm run media            (both)
//        npm run media -- --only shots | --only video
// Uses the web build, with live weather for London and live exchange rates.
import { devServer, launch, wait, tap, typeSlow, smoothScroll, shot, startRecording, encode, ripple, ROOT, OUT, only } from './lib.mjs';

const URL = 'http://localhost:8081/';
const stopServer = await devServer(URL, 'npx expo start --web --port 8081', { cwd: ROOT, env: { CI: '1' } });

const options = {
  flagFont: true,
  // Hide the browser focus ring on inputs, which iOS doesn't draw.
  extraCss: 'input:focus,input:focus-visible{outline:none !important}',
  timezoneId: 'Europe/London',
  locale: 'en-US',
  geolocation: { latitude: 51.5072, longitude: -0.1276 },
  permissions: ['geolocation'],
};
const tab = (page, name) => page.getByRole('tab', { name });
// Tabs stay mounted (inactive ones are marked inert), so pick the control on the active tab.
const active = ':visible:not([inert] *)';
const amount = (page) => page.locator(`input[aria-label^="Amount in"]${active}`).first();
// The amount field selects its text on focus; blur it so screenshots don't show the selection.
const blur = (page) => page.evaluate(() => document.activeElement?.blur());
const swap = (page) => page.locator(`[aria-label="Swap"]${active}`).first();

async function addCity(page, name, match, slow = false) {
  await tap(page, page.getByLabel('Add city')); await wait(page, 900);
  const box = page.getByPlaceholder('Search for a city');
  if (slow) await typeSlow(page, box, name, 110);
  else await box.fill(name);
  await wait(page, 1800);
  await tap(page, page.getByText(match).first()); await wait(page, 2200);
}

/** Swipe the weather pager sideways (dx > 0 goes back a page). */
async function swipe(page, dx) {
  await ripple(page, dx < 0 ? 330 : 60, 450);
  await page.evaluate((dx) => {
    const pager = [...document.querySelectorAll('div')]
      .filter((d) => d.scrollWidth > d.clientWidth + 50 && getComputedStyle(d).overflowX !== 'visible')
      .sort((a, b) => b.clientWidth - a.clientWidth)[0];
    pager.scrollBy({ left: -dx * (pager.clientWidth / 270), behavior: 'smooth' });
  }, dx);
  await wait(page, 900);
}

async function typeAmount(page, value) {
  await tap(page, amount(page));
  await page.keyboard.press('Control+A');
  await amount(page).pressSequentially(value, { delay: 150 });
}

try {
  if (only('shots')) {
    const { browser, page } = await launch(options);
    await page.goto(URL); await wait(page, 6000);
    await shot(page, `${OUT}/01-weather.png`);
    await addCity(page, 'Tokyo', /Tokyo.*Japan/);
    await addCity(page, 'New York', /New York.*United States/);
    await shot(page, `${OUT}/02-weather-city.png`);
    await tap(page, tab(page, 'Currency')); await wait(page, 2500);
    await amount(page).fill('250'); await blur(page); await wait(page, 300);
    await tap(page, page.getByText('GBP', { exact: true }).first()); await wait(page, 900);
    await shot(page, `${OUT}/03-currency.png`);
    await tap(page, page.getByLabel(/^Change /).first()); await wait(page, 1500);
    await shot(page, `${OUT}/04-currency-picker.png`);
    await page.goto(URL + 'measure'); await wait(page, 3000);
    await tap(page, page.getByText('Distance', { exact: true }).first()); await wait(page, 600);
    await amount(page).fill('10'); await blur(page); await wait(page, 600);
    await shot(page, `${OUT}/05-measure.png`);
    await browser.close();
  }

  if (only('video')) {
    const { browser, page } = await launch(options);
    await page.goto(URL); await wait(page, 6000);
    const rec = await startRecording(page);
    await wait(page, 1500);
    await smoothScroll(page, 500, { steps: 25 }); await wait(page, 500);
    await smoothScroll(page, -500, { steps: 25 }); await wait(page, 500);
    await addCity(page, 'Tokyo', /Tokyo.*Japan/, true);
    await swipe(page, 300); await wait(page, 1200);
    await swipe(page, -300); await wait(page, 1200);
    await tap(page, tab(page, 'Currency')); await wait(page, 1800);
    await typeAmount(page, '250'); await wait(page, 900);
    await tap(page, page.getByText('GBP', { exact: true }).first()); await wait(page, 1000);
    await tap(page, page.getByText('JPY', { exact: true }).first()); await wait(page, 1000);
    await tap(page, swap(page)); await wait(page, 1400);
    await tap(page, tab(page, 'Measure')); await wait(page, 1600);
    await typeAmount(page, '75'); await wait(page, 1000);
    await tap(page, page.getByText('Distance', { exact: true }).first()); await wait(page, 900);
    await typeAmount(page, '42.195'); await wait(page, 2000);
    const frames = await rec.stop();
    await browser.close();
    encode(frames, OUT, 'demo', { posterAt: 0.05 });
  }
} finally {
  await stopServer();
}
