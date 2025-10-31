// ws-server.js
import http from 'http'
import { WebSocketServer } from 'ws'
import { createRequire } from 'module'

// Create a require() function in ESM
const require = createRequire(import.meta.url)
const { setupWSConnection } = require('y-websocket')

const port = process.env.PORT || 1234

const server = http.createServer((req, res) => {
  res.writeHead(200)
  res.end('Yjs WebSocket Server')
})

const wss = new WebSocketServer({ server })

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req)
})

server.listen(port, () => {
  console.log(`WebSocket server running at ws://localhost:${port}`)
})
