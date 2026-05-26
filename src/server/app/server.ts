import { createServer } from 'http';
import { RealtimeWebSocketServer } from '../transport/websocketServer';

const PORT = process.env.PORT || 8080;

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', service: 'aferix-cloud-backend' }));
});

// Initialize the WebSocket Distributed Runtime
new RealtimeWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`[Aferix Server] Realtime Cloud Backend listening on port ${PORT}`);
});
