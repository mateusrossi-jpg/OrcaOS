import { createServer } from 'http';
import { RealtimeWebSocketServer } from '../transport/websocketServer';
import { aferixLogger } from '../../core/debug/aferixLogger';

const PORT = process.env.PORT || 8080;

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', service: 'aferix-cloud-backend' }));
});

// Initialize the WebSocket Distributed Runtime
new RealtimeWebSocketServer(server);

server.listen(PORT, () => {
  aferixLogger.info('Aferix Server', `Realtime Cloud Backend listening on port ${PORT}`);
});
