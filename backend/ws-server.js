const http = require('http');
const WebSocket = require('ws');

const { setupWSConnection } = require('y-websocket/server');

const server = http.createServer((request, response) => {
  // This handles Render's HTTP health check
  if (request.url === '/' || request.url === '/healthz') {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('ok'); // Tell Render the server is healthy
    return;
  }

  // Fallback response for any other HTTP requests
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Yjs WebSocket server is running. Connect via wss://');
});

// Attach the WebSocket server to the HTTP server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections as before
wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req);
});

// Render provides the PORT environment variable
const PORT = process.env.PORT || 1234;

server.listen(PORT, () => {
  console.log(`✅ YJS WebSocket Server running on port ${PORT}`);
});
