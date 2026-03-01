import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used - do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      // Alias @ to the src directory
      { find: '@', replacement: path.resolve(__dirname, './src') },

      // Force all three.js imports to use the same instance
      { find: 'three', replacement: path.resolve(__dirname, './node_modules/three') },

      // ── Neutralize uninstalled packages referenced by dead-code shadcn/ui files ──
      // These shadcn/ui files are protected system files that cannot be deleted.
      // They import @radix-ui/* which is NOT installed. Redirect to empty stubs
      // so Vite never attempts to fetch the missing packages.
      { find: /^@radix-ui\/.*/, replacement: path.resolve(__dirname, './src/app/utils/empty-module.ts') },

      // next-themes is imported by the dead-code sonner.tsx ui file
      { find: 'next-themes', replacement: path.resolve(__dirname, './src/app/utils/empty-module.ts') },

      // Prevent react-force-graph-3d from being loaded
      { find: 'react-force-graph-3d', replacement: path.resolve(__dirname, './src/app/utils/empty-module.ts') },
    ],
  },
})
