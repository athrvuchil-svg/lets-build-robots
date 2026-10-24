import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { batteryRuntime, divider, forgeMetrics, i2cScan, servoTorque, stepper, wheelSpeed } from '../src/utils/robotMath.mjs';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('all six LBR views exist and expose their primary route content', async () => {
  const routes = [
    ['src/pages/index.mdx', 'Try Live Robots'],
    ['src/pages/forge/index.mdx', 'The Forge'],
    ['src/pages/playground/index.mdx', '3D Leg Playground'],
    ['src/pages/traps/index.mdx', 'Common Traps'],
    ['src/pages/roadmap/index.mdx', 'Robotics Roadmap'],
    ['src/pages/challenges/index.mdx', 'Challenges'],
  ];
  for (const [path, marker] of routes) assert.match(await read(path), new RegExp(marker));
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
  assert.equal(catalog.length, 23);
  for (const id of ['esp32-devkit-v1', 'mg90s-servo-x12', 'buck-5v-8a', 'mpu6050-imu', 'txs0108e-shifter', 'nema17-stepper', 'bme280-env', 'ec11-encoder']) assert.ok(catalog.some((part) => part.id === id));
  const servos = catalog.find((part) => part.id === 'mg90s-servo-x12');
  const lipo = catalog.find((part) => part.id === 'lipo-2s-2200');
  assert.equal(servos.stallA, 9.6);
  assert.equal(lipo.stallA, 45);
  assert.match(await read('src/components/ComponentCatalog.astro'), /data-catalog-search/);
  const forge = await read('src/components/ForgePicker.astro');
  assert.match(forge, /actuatorStallA/);
  assert.match(forge, /Quartz Components/);
});

test('all 23 catalog entries expose both real regional buy URLs', async () => {
  const catalog = JSON.parse(await read('src/data/components.json'));
  for (const part of catalog) {
    assert.match(part.in.url, /^https:\/\//, part.id);
    assert.match(part.us.url, /^https:\/\//, part.id);
  }
  const sim = await read('src/components/LocalSimulatorWorkspace.astro');
  for (const id of ['spiderbot', 'arm', 'line', 'radar']) assert.match(sim, new RegExp(id));
  assert.match(sim, /requestAnimationFrame/);
  assert.match(sim, /youtube-nocookie\.com\/embed/);
  assert.match(sim, /pointerdown/);
  assert.match(sim, /radarDistance = Number\(el\.value\)/);
});

test('pure calculators and Forge presets produce observable engineering results', async () => {
  const catalog = JSON.parse(await read('src/data/components.json'));
  const pick = (...ids) => ids.map((id) => catalog.find((part) => part.id === id));
  const good = forgeMetrics(pick('esp32-devkit-v1', 'mg90s-servo-x12', 'pca9685-16ch', 'buck-5v-8a', 'lipo-2s-2200', 'mpu6050-imu'));
  assert.ok(good.failures.some((message) => message.includes('regulator overload')));
  assert.equal(good.pwmNeeded, 12);
  const bad = forgeMetrics(pick('esp32-devkit-v1', 'mg90s-servo-x12', 'bat-9v-alkaline', 'hcsr04-5v'));
  assert.ok(bad.failures.length >= 2);
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
  for (const marker of ['global-kill-island-btn', 'mode-toggle-btn', 'region-select', 'theme-toggle-btn', 'lbr-search-open', 'lbr-saved-open']) assert.match(top, new RegExp(marker));
  for (const marker of ['Show All', 'Safe for Anything', 'Best for Sensors', 'Careful at Startup', 'Never Touch']) assert.match(traps, new RegExp(marker));
  for (const marker of ['data-battery-output', 'data-torque-output', 'data-divider-output', 'data-stepper-output', 'data-i2c-output', 'data-wheel-output']) assert.match(tools, new RegExp(marker));
  assert.match(playground, /Play Walking Animation Loop/);
  assert.match(playground, /requestAnimationFrame/);
});
