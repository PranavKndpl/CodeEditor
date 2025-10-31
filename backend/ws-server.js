const http = require('http');
const WebSocket = require('ws');
const setupWSConnection = require('y-websocket/bin/utils.js').setupWSConnection;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req);
});

const PORT = process.env.PORT || 1234;
server.listen(PORT, () => {
  console.log(`✅ YJS WebSocket Server running on port ${PORT}`);
});
