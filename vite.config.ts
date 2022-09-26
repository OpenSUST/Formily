import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, writeFileSync } from 'fs'

if (!existsSync('config.json')) {
  writeFileSync('config.json', JSON.stringify({
    color: 'red',
    name: '脆弱铅釉陶文物数据库',
    userMenuName: '铅釉陶',
    cover: ''
  }, null, 2))
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()]
})
