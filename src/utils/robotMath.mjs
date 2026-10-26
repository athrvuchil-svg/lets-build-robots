export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function forgeMetrics(parts, region = 'IN', wifi = true) {
  const ids = new Set(parts.map((part) => part.id));
  const mcu = parts.find((part) => part.kind === 'MCU');
  const batteries = parts.filter((part) => part.kind === 'battery');
  const actuators = parts.filter((part) => ['servo', 'motor', 'stepper'].includes(part.kind));
  const motors = parts.filter((part) => part.kind === 'motor');
  const steppers = parts.filter((part) => part.kind === 'stepper');
  const regulators = parts.filter((part) => part.kind === 'power' && (part.max5vA || 0) > 0);
  const motionDrivers = parts.filter((part) => part.kind === 'driver' && part.id !== 'pca9685-16ch');
  const servoStallA = parts.filter((part) => part.kind === 'servo').reduce((sum, part) => sum + (part.stallA || 0), 0);
  const actuatorStallA = actuators.reduce((sum, part) => sum + (part.stallA || 0), 0);
  const pwmNeeded = actuators.reduce((sum, part) => sum + (part.pwm || 0), 0);
  const pwmAvailable = (mcu?.pwm || 0) + (ids.has('pca9685-16ch') ? 16 : 0);
  const requiredSupplyA = actuatorStallA * 1.25;
  const maxBatteryA = batteries.length ? Math.max(...batteries.map((part) => part.maxContinuousA ?? part.stallA ?? 0)) : 0;
  const railCapacity = regulators.length ? Math.max(...regulators.map((part) => part.max5vA || 0)) : 0;
  const driverCapacity = motionDrivers.length ? Math.max(...motionDrivers.map((part) => part.driverMaxA || 0)) : 0;
  const highVoltageSignals = parts.filter((part) => (part.signalV || 0) > 3.3);
  const builtInStepperDriver = steppers.some((part) => part.id === '28byj48-stepper');
  const needsMotionDriver = (motors.length > 0 || (steppers.length > 0 && !builtInStepperDriver)) && motionDrivers.length === 0;
  const hasI2cClash = parts.filter((part) => part.i2c).reduce((map, part) => {
    map[part.i2c] = (map[part.i2c] || 0) + 1;
    return map;
  }, {});
  const clashes = Object.entries(hasI2cClash).filter(([, count]) => count > 1).map(([address]) => address);
  const failures = [];
  const warnings = [];
  const ok = [];
  if (!mcu) failures.push('🛑 Choose a robot brain before wiring.');
  if (actuatorStallA && !batteries.length) failures.push('🛑 No battery selected: add a supported power source.');
  else if (actuatorStallA && requiredSupplyA > maxBatteryA) failures.push(`🛑 Battery headroom is short: ${requiredSupplyA.toFixed(1)}A needed, ${maxBatteryA.toFixed(1)}A rated.`);
  else if (actuatorStallA) ok.push('✅ Battery headroom passes');
  if (servoStallA > 0.6 && !regulators.length) failures.push(`🛑 Servo rail risk: ${servoStallA.toFixed(1)}A stall current cannot come from the controller 5V rail.`);
  else if (servoStallA && servoStallA * 1.25 > railCapacity) failures.push(`🛑 5V regulator overload: ${(servoStallA * 1.25).toFixed(1)}A required, ${railCapacity.toFixed(1)}A rated.`);
  else if (servoStallA) ok.push('✅ Separate servo rail passes');
  if (pwmNeeded >= 8 && !ids.has('pca9685-16ch')) warnings.push(`⚠️ ${pwmNeeded} PWM channels requested: add the PCA9685.`);
  else if (pwmNeeded) ok.push('✅ PWM budget passes');
  if (mcu?.logicV === 3.3 && highVoltageSignals.length && !ids.has('txs0108e-shifter')) failures.push(`🛑 ${highVoltageSignals.map((part) => part.part).join(', ')} expose 5V signals; protect the 3.3V input with TXS0108E or a suitable divider.`);
  if (wifi && ids.has('esp32-devkit-v1')) warnings.push('📡 Wi-Fi is on: use ADC1 GPIO 32–39 for analog sensors; ADC2 is unavailable during Wi-Fi.');
  if (clashes.length) failures.push(`🛑 I²C collision at ${clashes.join(', ')}: change MPU-6050 AD0 or a device address jumper.`);
  else if (parts.some((part) => part.i2c)) ok.push('✅ I²C addresses are unique');
  if (needsMotionDriver) failures.push('🛑 Add a motor or stepper driver before wiring an actuator that cannot be driven directly by the MCU.');
  if (steppers.length && driverCapacity && Math.max(...steppers.map((part) => part.stallA || 0)) > driverCapacity) failures.push(`🛑 Driver current is short: the selected stepper needs ${Math.max(...steppers.map((part) => part.stallA || 0)).toFixed(1)}A, but the selected driver is rated ${driverCapacity.toFixed(1)}A.`);
  if (regulators.length > 1) warnings.push(`⚠️ ${regulators.length} regulated 5V sources selected: do not parallel outputs unless the datasheets explicitly allow it.`);
  if (ids.has('l298n-driver')) warnings.push('🔥 L298N is lossy and hot; a MOSFET driver is the cooler choice.');
  const price = (part) => region === 'US' ? part.us.price : part.in.price;
  const total = parts.reduce((sum, part) => sum + price(part), 0);
  const threshold = region === 'US' ? 35 : 500;
  const shipping = total < threshold ? (region === 'US' ? 5.99 : 60) : 0;
  const weight = parts.reduce((sum, part) => sum + (part.weightG || 0), 110);
  return { failures, warnings, ok, mcu, actuatorStallA, servoStallA, pwmNeeded, pwmAvailable, requiredSupplyA, maxBatteryA, railCapacity, driverCapacity, weight, total, threshold, shipping, clashes, highVoltageSignals, regulators, motionDrivers };
}

export function batteryRuntime({ capacityMah = 2200, cells = 2, cRating = 30, drawA = 1, stallA = 5 }) {
  const voltage = cells * 3.7;
  const safeContinuousA = capacityMah / 1000 * cRating;
  const runtimeMin = drawA > 0 ? (capacityMah / 1000 / drawA) * 60 * 0.8 : 0;
  return { voltage, safeContinuousA, runtimeMin, cutoffV: cells * 3.5, pass: safeContinuousA >= drawA && safeContinuousA >= stallA };
}

export function servoTorque({ armCm = 10, payloadG = 100, linkG = 50, margin = 1.5 }) {
  const kgCm = ((payloadG * armCm) + (linkG * armCm * 0.5)) / 1000 * margin;
  return { kgCm, Nm: kgCm * 0.0980665 };
}

export function divider({ sourceV = 5, targetV = 3.3, r1K = 10 }) {
  const r2K = (targetV * r1K) / (sourceV - targetV);
  const actualV = sourceV * r2K / (r1K + r2K);
  return { r2K, actualV, needsShifter: true };
}

export function stepper({ angle = 1.8, microstep = 16, pitch = 2, teeth = 20, leadscrew = false }) {
  const stepsPerRev = 360 / angle * microstep;
  const travel = leadscrew ? pitch : pitch * teeth;
  return { stepsPerRev, stepsPerMm: stepsPerRev / travel, vrefA: 1.5 * 0.8 };
}

export function i2cScan(selected) {
  const counts = selected.reduce((map, device) => {
    map[device.address] = (map[device.address] || 0) + 1;
    return map;
  }, {});
  return { counts, collisions: Object.keys(counts).filter((address) => counts[address] > 1) };
}

export function wheelSpeed({ rpm = 300, diameterMm = 65, weightKg = 1.5, inclineDeg = 10 }) {
  const circumferenceM = Math.PI * diameterMm / 1000;
  const speedMps = rpm / 60 * circumferenceM;
  const torqueNm = weightKg * 9.81 * Math.sin(inclineDeg * Math.PI / 180) * (diameterMm / 2000) / 2;
  return { speedMps, speedKmh: speedMps * 3.6, torqueNm, driver: torqueNm > 1 ? 'TB6612FNG / higher-current MOSFET driver' : 'TB6612FNG' };
}
