const http = require('http');
const WebSocket = require('ws');

const { setupWSConnection } = require('y-websocket/bin/utils');

const server = http.createServer((request, response) => {
  // This handles Render's HTTP health check
  if (request.url === '/' || request.url === '/healthz') {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('ok'); // Tell Render the server is healthy
    return;
  }

  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Yjs WebSocket server is running. Connect via wss://');
});


const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req);
});

const PORT = process.env.PORT || 1234;

server.listen(PORT, () => {
  console.log(`✅ YJS WebSocket Server running on port ${PORT}`);
});
