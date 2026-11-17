/**
 * 一条命令同时启动「前端」和「AI 服务」，方便本地演示。
 * 用法：npm run dev:all
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const TARGETS = [
  {
    label: 'AI  ',
    color: '\x1b[35m',
    args: [path.join(root, 'server', 'index.js')]
  },
  {
    label: 'WEB ',
    color: '\x1b[36m',
    args: [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')]
  }
]

const children = TARGETS.map(t => {
  const child = spawn(process.execPath, t.args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] })
  const tag = `${t.color}[${t.label}]\x1b[0m `
  const relay = (stream) => stream.on('data', d => {
    String(d).split(/\r?\n/).filter(Boolean).forEach(line => console.log(tag + line))
  })
  relay(child.stdout)
  relay(child.stderr)
  child.on('exit', code => console.log(`${tag}进程结束 (code ${code})`))
  return child
})

const shutdown = () => {
  children.forEach(c => { try { c.kill() } catch { /* ignore */ } })
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

console.log('\n  启动中：前端 http://localhost:5173    AI 服务 http://localhost:3001\n')
