import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, writeFileSync } from 'fs'

if (!existsSync('config.json')) {
  writeFileSync('config.json', JSON.stringify({
    color: 'red',
    name: '脆弱铅釉陶文物数据库',
    userMenuName: '铅釉陶',
    cover: '',
    blackTitle: false,
    logo: ''
  }, null, 2))
}

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          echarts: ['echarts', 'echarts-for-react'],
          three: ['three', 'three-stdlib', '@react-three/drei', '@react-three/fiber'],
          handsontable: ['handsontable', '@handsontable/react']
        }
      }
    }
  }
})
