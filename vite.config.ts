import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
      // Force all three.js imports to use the same instance
      'three': path.resolve(__dirname, './node_modules/three'),
      // Prevent react-force-graph-3d from being loaded
      'react-force-graph-3d': path.resolve(__dirname, './src/app/utils/empty-module.ts'),
    },
  },
})