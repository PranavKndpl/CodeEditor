import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { setupWSConnection } from 'y-websocket/bin/utils.cjs'; 

const PORT = process.env.PORT || 10000;

const wss = new WebSocketServer({ port: PORT });

console.log(`✅ Y-WebSocket server running on port ${PORT}`);

wss.on('connection', (conn, req) => {
  const docName = req.url?.slice(1) || 'monaco-editor-room';
  const ydoc = new Y.Doc();
  setupWSConnection(conn, req, { docName, ydoc });
});
