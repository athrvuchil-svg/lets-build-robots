import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const optionalNumber = z.number().nullable().optional();
const partsSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['motor', 'driver', 'controller', 'sensor', 'battery', 'servo', 'structure', 'misc']),
  key_specs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  voltage: z.object({ nominal_v: optionalNumber, logic_v: optionalNumber, signal_v: optionalNumber }),
  current: z.object({ draw_a: optionalNumber, stall_a: optionalNumber, max_a: optionalNumber }),
  compatible_with: z.array(z.string()),
  common_mistakes: z.array(z.string()),
  price_inr: z.number().nonnegative(),
  price_usd: z.number().nonnegative(),
  price_last_checked: z.string(),
  buy_links: z.array(z.object({ store: z.string(), url: z.string().url(), affiliate: z.boolean() })),
  datasheet_url: z.string().url().nullable(),
  safety_notes: z.array(z.string()),
});

const buildSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  goal: z.string().min(1),
  part_ids: z.array(z.string()),
  status: z.enum(['verified', 'draft', 'planned']),
});

const projectSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  source_url: z.string().url(),
  license: z.string(),
  status: z.enum(['verified', 'needs-review', 'planned']),
});

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  parts: defineCollection({
    loader: file('src/data/components.json', {
      parser: (text) => JSON.parse(text).map((part: Record<string, any>) => ({
        id: part.id,
        name: part.part,
        category: ({ MCU: 'controller', motor: 'motor', driver: 'driver', servo: 'servo', battery: 'battery', sensor: 'sensor', power: 'misc', safety: 'misc', stepper: 'motor', structure: 'structure' } as Record<string, string>)[part.kind] ?? 'misc',
        key_specs: { kind: part.kind, role: part.role, pwm: part.pwm ?? 0, weight_g: part.weightG },
        voltage: { nominal_v: null, logic_v: part.logicV ?? null, signal_v: part.signalV ?? null },
        current: { draw_a: part.drawA ?? null, stall_a: part.stallA ?? null, max_a: part.max5vA ?? part.maxContinuousA ?? null },
        compatible_with: [],
        common_mistakes: [],
        price_inr: part.in.price,
        price_usd: part.us.price,
        price_last_checked: 'VERIFY',
        buy_links: [{ store: part.in.store, url: part.in.url, affiliate: false }, { store: part.us.store, url: part.us.url, affiliate: false }],
        datasheet_url: null,
        safety_notes: [],
      })),
    }),
    schema: partsSchema,
  }),
  builds: defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/content/builds' }), schema: buildSchema }),
  projects: defineCollection({ loader: glob({ pattern: '**/*.json', base: './src/data/projects' }), schema: projectSchema }),
};
