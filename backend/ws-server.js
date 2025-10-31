import http from "http";
import WebSocket from "ws";
import * as Y from "yjs";
import { setupWSConnection } from "y-websocket/bin/utils.js";

const port = process.env.PORT || 1234;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on("connection", (socket, req) => {
  const docName = req.url.slice(1) || "default-room";
  setupWSConnection(socket, req, { docName });
});

server.listen(port, () => {
  console.log(`✅ Y-WebSocket server running on port ${port}`);
});
