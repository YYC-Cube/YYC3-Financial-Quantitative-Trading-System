/**
 * @file vite.config.ts
 * @description Vite 构建配置文件，配置 React 插件、Tailwind CSS、路径别名和构建优化选项
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-20
 * @updated 2026-03-20
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags config,vite,typescript,critical,public
 * @depends vite,@vitejs/plugin-react,@tailwindcss/vite
 */

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  server: {
    port: 3188,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-chart': ['recharts', 'lightweight-charts'],
          'vendor-three': ['three'],
          'vendor-utils': ['date-fns'],
        },
      },
    },
  },
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
