# Let's Build Robots (LBR)

Let's Build Robots is a solo, student-led beginner robotics learning platform created and maintained by **Athrv Uchil**. It helps learners explore robot projects, check parts before wiring, and connect motion to code.

## What is live

LBR is a browser-first robotics learning lab with a clear public promise:

- four local canvas labs for walking, reaching, PID steering, and radar/conveyor behavior;
- a deterministic Forge that checks power, PWM, voltage, I²C, driver compatibility, weight, pricing, and delivery;
- a 52-part hardware catalog with search, filters, build-path shortcuts, regional vendor links, and Forge handoff;
- six client-side robotics calculators;
- an isometric pose-to-code playground for Arduino, ESP32, and ROS 2 learners;
- mistake-saving ESP32 pin guidance and a practical learning roadmap.

The product deliberately separates **browser models**, **live public GitHub pulls**, and **real hardware claims**. It does not pretend to control a physical robot or replace a datasheet.

The tools are educational aids, not manufacturer certification. Prices and availability are snapshots and can change. Always follow component datasheets and safe battery handling practices.

## Development

```bash
npm install
npm run check
npm run build
npm run dev
```

## Deploy a preview

The production target is Cloudflare Pages. After building, deploy the generated `dist/` directory:

```bash
npx wrangler pages deploy dist --project-name lets-build-robots --commit-dirty --no-bundle
```

The public site is `https://lets-build-robots.pages.dev/`.

See [PROVENANCE.md](PROVENANCE.md) for project history and data notes. Contributions are not currently being accepted as company membership; see [CONTRIBUTING.md](CONTRIBUTING.md) for the future contribution boundary.

## License

Code and original written content are released under the MIT License. Third-party names and component data remain subject to their respective owners and sources.
