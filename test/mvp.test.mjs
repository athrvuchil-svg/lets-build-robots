import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { batteryRuntime, divider, forgeMetrics, i2cScan, servoTorque, stepper, wheelSpeed } from '../src/utils/robotMath.mjs';
import { commerceConfig, decorateMerchantUrl } from '../src/utils/commerce.mjs';
import { bindPresetButtons } from '../src/utils/forgeUi.mjs';
import { renderCanvasFrame } from '../src/utils/canvasFrame.mjs';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('all six LBR views exist and expose their primary route content', async () => {
  const routes = [
    ['src/pages/index.mdx', 'Play Interactive 60FPS Sim'],
    ['src/pages/forge/index.mdx', 'The Forge'],
    ['src/pages/playground/index.mdx', '3D Leg Playground'],
    ['src/pages/traps/index.mdx', 'Common Traps'],
    ['src/pages/roadmap/index.mdx', 'Robotics Roadmap'],
    ['src/pages/challenges/index.mdx', 'Challenges'],
    ['src/pages/earn/index.mdx', 'Earn With LBR'],
  ];
  for (const [path, marker] of routes) assert.match(await read(path), new RegExp(marker));
});

test('phase 1 foundation exposes both audience paths and validated collections', async () => {
  const home = await read('src/pages/index.mdx');
  const layout = await read('src/layouts/LbrLayout.astro');
  const contentConfig = await read('src/content.config.ts');
  assert.match(home, /I’m a beginner/);
  assert.match(home, /I’m an advanced builder/);
  assert.match(home, /href="\/robots\/"/);
  assert.match(home, /href="\/docs\/"/);
  assert.match(layout, /id="main-content"/);
  assert.match(layout, /SiteFooter/);
  assert.match(contentConfig, /parts: defineCollection/);
  assert.match(contentConfig, /builds: defineCollection/);
  assert.match(contentConfig, /projects: defineCollection/);
});

test('public product copy stays aligned with the live catalog size', async () => {
  const catalog = JSON.parse(await read('src/data/components.json'));
  assert.match(await read('README.md'), new RegExp(`${catalog.length}-part hardware catalog`));
  assert.match(await read('src/pages/index.mdx'), new RegExp(`<b>${catalog.length}<\\/b> mapped parts`));
  assert.match(await read('src/pages/index.mdx'), /data-design-style="warm-editorial-engineering-studio"/);
  assert.match(await read('src/pages/index.mdx'), /Play Interactive 60FPS Sim/);
  assert.match(await read('src/pages/index.mdx'), /Load Verified Parts List in The Forge/);
  assert.equal((await read('LANDING_PAGE_PROMPT.md')).trim().split(/\n\s*\n/).length, 3);
  assert.match(await read('src/pages/forge/index.mdx'), /components\.length/);
  const partner = await read('src/components/PartnerCTA.astro');
  assert.match(partner, /partnership inquiry/i);
  assert.match(partner, /Affiliate or sponsor credentials/);
  const earningPlan = await read('src/components/EarningPlan.astro');
  assert.match(earningPlan, /PUBLIC_PAYMENT_LINK/);
  assert.match(await read('MONETIZATION.md'), /first rupee/);
});

test('deterministic safety and lifecycle contracts are present', async () => {
  const forge = await read('src/components/ForgePicker.astro');
  const registry = await read('src/utils/islandRegistry.ts');
  const leg = await read('src/components/LegPlayground.astro');
  assert.match(forge, /spiderbot-good/);
  assert.match(forge, /requiredSupplyA/);
  assert.match(forge, /0x68/);
  assert.match(registry, /__LBR_ACTIVE_TOOL__/);
  assert.match(leg, /Adafruit_PWMServoDriver/);
  assert.match(leg, /JointState/);
});

test('beginner-first CSS is static and does not depend on JavaScript to hide specs', async () => {
  const css = await read('src/styles/custom.css');
  assert.match(css, /\.eng-only,.eng-only-inline\s*\{\s*display:none/);
  assert.match(css, /body\.engineer-mode \.eng-only/);
});

test('catalog and Forge math protect the user-facing baseline', async () => {
  const catalog = JSON.parse(await read('src/data/components.json'));
  assert.equal(catalog.length, 52);
  for (const id of ['esp32-devkit-v1', 'mg90s-servo-x12', 'buck-5v-8a', 'mpu6050-imu', 'txs0108e-shifter', 'nema17-stepper', 'bme280-env', 'ec11-encoder', 'rp2040-pico-w', 'drv8825-driver', 'qtr-8a-line-array', '2wd-chassis', 'jumper-wire-kit']) assert.ok(catalog.some((part) => part.id === id));
  const servos = catalog.find((part) => part.id === 'mg90s-servo-x12');
  const lipo = catalog.find((part) => part.id === 'lipo-2s-2200');
  assert.equal(servos.stallA, 9.6);
  assert.equal(lipo.stallA, 45);
  const componentCatalog = await read('src/components/ComponentCatalog.astro');
  assert.match(componentCatalog, /data-catalog-search/);
  for (const marker of ['data-catalog-kind', 'data-catalog-sort', 'data-catalog-role', 'data-catalog-status', 'data-catalog-copy', 'data-catalog-copy-status', 'data-region-link', 'Add to Forge', 'directProductLinks', 'spiderbot-good', 'esp32-safe']) assert.match(componentCatalog, new RegExp(marker));
  const forgePicker = await read('src/components/ForgePicker.astro');
  for (const marker of ['rp2040-pico-w', 'drv8825-driver', 'qtr-8a-line-array', '2wd-chassis', 'jumper-wire-kit']) assert.match(forgePicker, new RegExp(marker));
  assert.match(forgePicker, /requestedIds/);
  assert.match(await read('src/pages/forge/index.mdx'), /components\.length/);
  const forge = await read('src/components/ForgePicker.astro');
  assert.match(forge, /actuatorStallA/);
  assert.match(forge, /Quartz Components/);
  assert.match(forge, /decorateCatalog/);
  assert.match(await read('src/components/ComponentCatalog.astro'), /data-commerce-link/);
});

test('all catalog entries expose both real regional buy URLs', async () => {
  const catalog = JSON.parse(await read('src/data/components.json'));
  const vendors = new Set();
  for (const part of catalog) {
    assert.match(part.in.url, /^https:\/\//, part.id);
    assert.match(part.us.url, /^https:\/\//, part.id);
    vendors.add(part.in.store); vendors.add(part.us.store);
  }
  for (const vendor of ['Robu.in', 'Quartz Components', 'Adafruit', 'Pololu']) assert.ok(vendors.has(vendor), vendor);
  const forgeMarkup = await read('src/components/ForgePicker.astro');
  const catalogMarkup = await read('src/components/ComponentCatalog.astro');
  assert.match(forgeMarkup, /data-buy-link/);
  assert.match(forgeMarkup, /Buy on \$\{shop\.store\}/);
  assert.match(catalogMarkup, /data-commerce-link/);
  const sim = await read('src/components/LocalSimulatorWorkspace.astro');
  for (const id of ['spiderbot', 'arm', 'line', 'radar']) assert.match(sim, new RegExp(id));
  assert.match(sim, /requestAnimationFrame/);
  assert.match(sim, /youtube-nocookie\.com\/embed/);
  assert.match(sim, /pointerdown/);
  assert.match(sim, /radarDistance = Number\(el\.value\)/);
  assert.match(sim, /function drawCurrent/);
  assert.match(sim, /renderControls\(\); renderDetail\(\);/);
  assert.match(sim, /const clamp =/);
  assert.match(sim, /Canvas unavailable/);
  assert.match(sim, /releasePointerCapture/);
  assert.match(sim, /data-sim-fallback/);
  assert.match(sim, /Could not start/);
  const robotsPage = await read('src/pages/robots/index.mdx');
  assert.doesNotMatch(robotsPage, /Aarav_Mechatronics/);
  assert.match(robotsPage, /not a user testimonial/);
  assert.match(robotsPage, /robot-workcell/);
  assert.match(await read('src/components/VideoLibrary.astro'), /bmoGfBe63ZA/);
  assert.doesNotMatch(await read('src/components/VideoLibrary.astro'), /Community build pick/);
  assert.match(await read('src/components/VideoLibrary.astro'), /10-video build shelf/);
  assert.match(sim, /new URLSearchParams\(location\.search\)/);
});

test('pure calculators and Forge presets produce observable engineering results', async () => {
  const catalog = JSON.parse(await read('src/data/components.json'));
  const pick = (...ids) => ids.map((id) => catalog.find((part) => part.id === id));
  const good = forgeMetrics(pick('esp32-devkit-v1', 'mg90s-servo-x12', 'pca9685-16ch', 'buck-5v-8a', 'lipo-2s-2200', 'mpu6050-imu'));
  assert.ok(good.failures.some((message) => message.includes('regulator overload')));
  assert.equal(good.pwmNeeded, 12);
  const bad = forgeMetrics(pick('esp32-devkit-v1', 'mg90s-servo-x12', 'bat-9v-alkaline', 'hcsr04-5v'));
  assert.ok(bad.failures.length >= 2);
  const motorWithoutDriver = forgeMetrics(pick('esp32-devkit-v1', 'dc-gearmotor-12v', 'lipo-2s-2200'));
  assert.ok(motorWithoutDriver.failures.some((message) => message.includes('motor or stepper driver')));
  const highVoltageSensor = forgeMetrics(pick('esp32-devkit-v1', 'qtr-8a-line-array', 'lipo-2s-2200'));
  assert.ok(highVoltageSensor.failures.some((message) => message.includes('5V signals')));
  const protectedSensor = forgeMetrics(pick('esp32-devkit-v1', 'qtr-8a-line-array', 'txs0108e-shifter', 'lipo-2s-2200'));
  assert.equal(protectedSensor.failures.some((message) => message.includes('5V signals')), false);
  assert.ok(batteryRuntime({ capacityMah: 2200, cells: 2, cRating: 30, drawA: 2, stallA: 9.6 }).pass);
  assert.ok(servoTorque({ armCm: 10, payloadG: 100, linkG: 50, margin: 1.5 }).kgCm > 0);
  assert.ok(Math.abs(divider({ sourceV: 5, targetV: 3.3, r1K: 10 }).actualV - 3.3) < 0.01);
  assert.ok(stepper({ angle: 1.8, microstep: 16, pitch: 2, teeth: 20 }).stepsPerMm > 0);
  assert.deepEqual(i2cScan([{ address: '0x40' }, { address: '0x40' }]).collisions, ['0x40']);
  assert.ok(wheelSpeed({ rpm: 300, diameterMm: 65, weightKg: 1.5, inclineDeg: 10 }).speedKmh > 0);
});

test('global controls, pin filters, calculators, and pose loop are wired', async () => {
  const top = await read('src/components/TopUtilityBar.astro');
  const traps = await read('src/pages/traps/index.mdx');
  const tools = await read('src/components/RobotTools.astro');
  const playground = await read('src/components/LegPlayground.astro');
  for (const marker of ['global-kill-island-btn', 'mode-toggle-btn', 'region-select', 'theme-toggle-btn', 'lbr-search-open', 'lbr-saved-open', 'lbr-discovery-ribbon', 'data-discovery-filter', 'ArrowDown', 'ArrowUp', 'Enter', 'data-save-search']) assert.match(top, new RegExp(marker));
  for (const marker of ['Show All', 'Safe for Anything', 'Best for Sensors', 'Careful at Startup', 'Never Touch']) assert.match(traps, new RegExp(marker));
  for (const marker of ['data-battery-output', 'data-torque-output', 'data-divider-output', 'data-stepper-output', 'data-i2c-output', 'data-wheel-output']) assert.match(tools, new RegExp(marker));
  assert.match(playground, /Play walking loop/);
  assert.match(playground, /requestAnimationFrame/);
  assert.match(await read('src/components/LocalSimulatorWorkspace.astro'), /LOCAL SIM · 60 FPS/);
  assert.match(await read('src/components/ForgePicker.astro'), /data-forge-status/);
});

test('commerce links stay direct until approved referral values are supplied', () => {
  const direct = 'https://robu.in/product/example/';
  assert.equal(decorateMerchantUrl(direct, commerceConfig({})), direct);
  const tagged = decorateMerchantUrl(direct, commerceConfig({ PUBLIC_ROBU_REFERRAL_PARAM: 'ref', PUBLIC_ROBU_REFERRAL_ID: 'lbr-123' }));
  assert.equal(new URL(tagged).searchParams.get('ref'), 'lbr-123');
  assert.equal(new URL(decorateMerchantUrl('https://www.adafruit.com/product/1', { amazonInTag: 'tag-21' })).search, '');
});

test('DOM click contract applies Forge presets and renders a canvas frame', () => {
  const makeNode = (value = '', preset = '') => {
    const listeners = {};
    return {
      value, checked: false, dataset: { preset }, classList: { toggle() {} },
      addEventListener(type, listener) { listeners[type] = listener; },
      click() { listeners.click?.(); },
    };
  };
  const inputs = [makeNode('brain'), makeNode('battery')];
  const buttons = [makeNode('', 'working'), makeNode('', 'clear')];
  let updates = 0; let replaced = ''; let applied = '';
  const root = { querySelectorAll: () => buttons };
  const binding = bindPresetButtons({ root, presetMap: { working: ['brain'], clear: [] }, inputs, update: () => { updates += 1; }, replaceUrl: (name) => { replaced = name; }, onApply: (name) => { applied = name; } });
  binding.buttons[0].click();
  assert.equal(inputs[0].checked, true);
  assert.equal(inputs[1].checked, false);
  assert.equal(updates, 1);
  assert.equal(replaced, 'working');
  assert.equal(applied, 'working');
  const calls = [];
  const canvas = { getContext: () => ({ clearRect: () => calls.push('clear') }) };
  assert.equal(renderCanvasFrame(canvas, (ctx) => ctx.clearRect(0, 0, 1, 1)), true);
  assert.deepEqual(calls, ['clear']);
});
