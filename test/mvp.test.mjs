import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

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
  assert.ok(catalog.length >= 15);
  for (const id of ['esp32-devkit-v1', 'mg90s-servo-x12', 'buck-5v-8a', 'mpu6050-imu', 'txs0108e-shifter']) assert.ok(catalog.some((part) => part.id === id));
  const servos = catalog.find((part) => part.id === 'mg90s-servo-x12');
  const lipo = catalog.find((part) => part.id === 'lipo-2s-2200');
  assert.equal(servos.stallA, 9.6);
  assert.equal(lipo.stallA, 45);
  assert.match(await read('src/components/ComponentCatalog.astro'), /data-catalog-search/);
  const forge = await read('src/components/ForgePicker.astro');
  assert.match(forge, /actuatorStallA/);
  assert.match(forge, /Quartz Components/);
});
