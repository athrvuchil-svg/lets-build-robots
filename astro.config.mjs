import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://letsbuildrobots.tech',
  integrations: [
    starlight({
      title: "Let's Build Robots",
      description: 'A beginner-first bridge from web development to physical robots.',
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        { label: 'LBR Home', link: '/' },
        { label: 'Try Live Robots', link: '/robots/' },
        { label: 'The Forge', link: '/forge/' },
        { label: 'Leg Playground', link: '/playground/' },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
