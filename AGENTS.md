# Let's Build Robots (LBR) — Agent Rules

LBR is an open-source, beginner-first robotics learning platform for Athrv Uchil's NMIMS MPSTME Mechatronics Engineering term work. The hard academic milestone is the **NMIMS Term End Exams (TEE) period in November 2026**. The immediate shipping target is a public, fast demo by **Sunday, October 25, 2026**, at `letsbuildrobots.tech` or `lets-build-robots.pages.dev`.

## Six non-negotiable engineering rules

1. **Beginner-first CSS contract.** Plain-English explanations are visible by default. Technical content uses `.eng-only { display: none; }` and `.eng-only-inline { display: none; }`. `body.engineer-mode` reveals them with `display: block` and `display: inline-flex`. Do not invert this contract or depend on JavaScript for the initial hide state.
2. **Single-active-island lifecycle.** The global `window.__LBR_ACTIVE_TOOL__` registry permits only one simulator or 3D playground at once. Mounting calls `registerActiveIsland(name, destroyFn)`, which immediately destroys the previous island. `clearActiveIsland()` clears intervals and animation frames, sets active iframe sources to `about:blank` before removing them, and is called when switching away from simulator/playground views.
3. **Production payload under 30 KB initially.** Never ship the prototype's runtime Tailwind CDN. Production uses build-time Tailwind and self-hosted subsetted Plus Jakarta Sans and JetBrains Mono WOFF2 fonts with `font-display: swap`.
4. **Deterministic Forge math.** All hardware checks are pure calculations over `COMPONENTS_DB`: supply headroom is `totalStallA * 1.25`; protect an ESP32/Arduino 5V rail above `0.6A`; warn at 8 PWM channels without a PCA9685; guard 3.3V ESP32 pins from 5V sensors; explain the ESP32 ADC2/Wi-Fi, boot strap, and input-only pin traps; and detect duplicate I2C addresses with the MPU-6050 `AD0` remedy.
5. **India/USA shipping optimizer.** Support `IN` (₹, Robu.in threshold ₹500/+₹60, Quartz threshold ₹499/+₹59) and `US` ($35 free-shipping threshold, otherwise +$5.99). Show the exact gap to free shipping and warn about wasteful split orders.
6. **Baseline component database.** Preserve the exact 15-part baseline below before expanding it.

## Baseline `COMPONENTS_DB`

| id | part | electrical / mechanical facts | India | USA / Global |
|---|---|---|---|---|
| `esp32-devkit-v1` | MCU | 3.3V logic, 16 PWM, 0.6A 5V out, 0.25A draw, 10g | Robu.in ₹420 | Amazon $6.99 |
| `arduino-uno-r3` | MCU | 5.0V logic, 6 PWM, 0.5A 5V out, 0.08A draw, 25g | Robu.in ₹440 | Adafruit $9.95 |
| `mg90s-servo-x4` | 4x Metal Servos | 3.2A stall, 4 PWM, 56g | Robu.in ₹680 | Amazon $11.50 |
| `mg90s-servo-x12` | 12x Metal Servos | 9.6A stall, 12 PWM, 168g | Robu.in ₹1980 | Amazon $29.90 |
| `dc-gearmotor-12v` | 12V 300RPM Geared DC Motor | 3.5A stall, 2 PWM, 195g | Robu.in ₹390 | Pololu $14.95 |
| `pca9685-16ch` | 16-Ch I2C Servo Driver | `0x40`, +16 PWM, 12g | Robu.in ₹245 | Adafruit $14.95 |
| `buck-5v-8a` | 5V 8A Buck Regulator | `reg_5v_max_a: 8.0`, 38g | Robu.in ₹260 | Amazon $7.50 |
| `l298n-driver` | L298N BJT Driver | `bjt_lossy`, 2.0A max, 28g | Quartz ₹135 | Amazon $5.50 |
| `tb6600-driver` | TB6612FNG/MOSFET Driver | `mosfet_clean`, 10.0A max, 42g | Robu.in ₹320 | Adafruit $8.95 |
| `lipo-2s-2200` | 7.4V 2200mAh 2S LiPo | `max_continuous_a: 45.0`, 132g | Robu.in ₹1299 | Amazon $18.99 |
| `bat-9v-alkaline` | 9V Toy Battery | `max_continuous_a: 0.4`, 45g | Local ₹65 | Amazon $3.99 |
| `mpu6050-imu` | MPU-6050 6-DOF IMU | `0x68`, 3.3V, 5g | Robu.in ₹145 | Amazon $4.99 |
| `ds3231-rtc-0x68` | DS3231 RTC | `0x68`, 3.3V, 6g | Quartz ₹160 | Adafruit $5.95 |
| `hcsr04-5v` | HC-SR04 Ultrasonic Sensor | 5.0V signal, 9g | Robu.in ₹75 | Amazon $3.50 |
| `txs0108e-shifter` | TXS0108E Level Shifter | 5V-to-3.3V, 3g | Robu.in ₹65 | Adafruit $3.95 |

## Working agreements

- Keep the default user experience understandable to a first-year student.
- Do not replace deterministic hardware calculations with AI-generated guesses.
- Preserve the leak-proof teardown behavior on low-memory student Android devices.
- Communicate engineering truth plainly: distinguish verified, estimated, unsupported, unsafe, unavailable, and planned behavior. Never present a placeholder, affiliate link, AI suggestion, or budget compromise as a proven recommendation.
- Show trade-offs openly, including what a cheaper BOM saves, what it cannot safely do, and what evidence supports each recommendation.
- Run the smallest meaningful build/test check after every code change and report failures honestly.
