// ws-server.js
import http from 'http';
import WebSocket from 'ws';
import setupWSConnection from 'y-websocket/bin/utils.js';

const port = process.env.PORT || 1234;

// Create an HTTP server (needed by y-websocket)
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Yjs WebSocket Server');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (conn, req) => {
  // Setup Yjs WebSocket connection
  setupWSConnection(conn, req);
});

server.listen(port, () => {
  console.log(`WebSocket server running at ws://localhost:${port}`);
});
