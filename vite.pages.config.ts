import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'lowest-star-release-plan';
const base = process.env.GITHUB_ACTIONS ? `/${repositoryName}/` : '/';

export default defineConfig({
  root: 'static-site',
  base,
  publicDir: '../public',
  plugins: [react()],
  build: {
    outDir: '../pages-dist',
    emptyOutDir: true,
  },
});
