import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// tailwindcss() plugin hi Tailwind ko Vite me chalata hai (alag config file nahi chahiye)
export default defineConfig({
  plugins: [react(), tailwindcss()],
});