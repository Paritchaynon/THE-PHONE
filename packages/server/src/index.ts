import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { GameRoom } from './rooms/GameRoom';
import { db } from './db/database';

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

// Public Share Result Endpoint
app.get('/api/result/:shareCode', (req, res) => {
  const result = db.getResultByShareCode(req.params.shareCode);
  if (!result) {
    return res.status(404).json({ error: 'Result not found' });
  }
  return res.json(result);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'Between Us Server' });
});

const server = http.createServer(app);
const gameServer = new Server({
  transport: new WebSocketTransport({
    server
  })
});

// Register Game Room
gameServer.define('game_room', GameRoom);

server.listen(port, () => {
  console.log(`[Between Us] Authoritative Game Server running on port ${port}`);
});
