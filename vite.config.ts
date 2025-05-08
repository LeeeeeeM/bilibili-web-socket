import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  build: {
    minify: false,
    outDir: 'dist',
    lib: {
      entry: 'src/main.tsx',
      formats: ['umd'],
      name: 'bili-ws',
      fileName: (format) => `bili-ws.${format}.js`
    },
  }
})
