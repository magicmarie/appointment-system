import { fileURLToPath } from 'url'
import { start as startApi } from './api/server.js'

export async function start() {
  // Start the API server
  await startApi()
}

const __filename = fileURLToPath(import.meta.url)
if (process.argv[1] === __filename) {
  start().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
