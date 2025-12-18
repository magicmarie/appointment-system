import { fileURLToPath } from 'url'

export function start() {
  console.log('Appointment system starting...')
}

const __filename = fileURLToPath(import.meta.url)
if (process.argv[1] === __filename) {
  start()
}
