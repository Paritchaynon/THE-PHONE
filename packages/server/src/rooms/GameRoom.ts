import { Room, Client } from 'colyseus';
import { GameRoomStateSchema, PlayerStateSchema } from './schema/GameRoomState';
import { StoryEngine, PlayerSessionData } from '../engine/StoryEngine';
import {
  INITIAL_TRAITS,
  PlayerRole,
  ClientPrivateState,
  ClientSharedState,
  GameResultSummary
} from '@between-us/shared';
import { db } from '../db/database';

export class GameRoom extends Room<GameRoomStateSchema> {
  maxClients = 2;
  private storyEngine!: StoryEngine;
  private playerSessions: Map<string, PlayerSessionData> = new Map(); // sessionId -> PlayerSessionData
  private tokenToSessionMap: Map<string, PlayerSessionData> = new Map(); // token -> PlayerSessionData
  private roleAssigned: { playerA?: string; playerB?: string } = {};
  private completedResult?: GameResultSummary;

  onCreate(options: any) {
    this.setState(new GameRoomStateSchema());
    const roomCode = options.roomCode || this.roomId.substring(0, 6).toUpperCase();
    this.state.roomCode = roomCode;
    this.setMetadata({ roomCode });
    this.state.status = 'LOBBY';
    this.state.currentSceneId = 'ch1_intro';
    this.state.chapter = 1;

    this.storyEngine = new StoryEngine('ch1_intro');

    // Handle messages
    this.onMessage('READY', (client) => {
      const playerSession = this.playerSessions.get(client.sessionId);
      if (!playerSession) return;
      const playerSchema = this.state.players.get(client.sessionId);
      if (playerSchema) {
        playerSchema.ready = true;
      }

      // Check if both ready
      let readyCount = 0;
      this.state.players.forEach((p) => {
        if (p.ready && p.connected) readyCount++;
      });

      if (readyCount === 2 && this.state.status === 'LOBBY') {
        this.startGame();
      } else {
        this.broadcastSharedSync();
      }
    });

    this.onMessage('SUBMIT_CHOICE', (client, message: { choiceId: string }) => {
      if (this.state.status !== 'PLAYING') return;
      const session = this.playerSessions.get(client.sessionId);
      if (!session) return;

      const success = this.storyEngine.recordChoice(session, message.choiceId);
      if (success) {
        const schema = this.state.players.get(client.sessionId);
        if (schema) schema.choiceSubmitted = true;

        // Send confirmation only to this client
        this.sendPrivateSync(client);
        this.broadcastSharedSync();

        // Check if both players have submitted choice
        this.checkSceneResolution();
      }
    });

    this.onMessage('CONTINUE_REVEAL', (client) => {
      if (this.state.status !== 'REVEAL') return;
      // When reveal screen is acknowledged, step to next scene
      const session = this.playerSessions.get(client.sessionId);
      if (session) {
        session.hasChosen = true;
      }
      
      const sessionA = this.roleAssigned.playerA ? this.playerSessions.get(this.roleAssigned.playerA) : undefined;
      const sessionB = this.roleAssigned.playerB ? this.playerSessions.get(this.roleAssigned.playerB) : undefined;

      if (sessionA?.hasChosen && sessionB?.hasChosen) {
        this.advanceToNextScene();
      }
    });

    db.saveGame({
      id: this.roomId,
      roomCode: this.state.roomCode,
      status: 'LOBBY',
      startedAt: new Date().toISOString()
    });
  }

  onJoin(client: Client, options: any) {
    const reconnectToken = options.reconnectToken;

    // Check reconnection
    if (reconnectToken && this.tokenToSessionMap.has(reconnectToken)) {
      const existingSession = this.tokenToSessionMap.get(reconnectToken)!;
      // Re-bind to new client sessionId
      this.playerSessions.delete(existingSession.id);
      this.state.players.delete(existingSession.id);

      existingSession.id = client.sessionId;
      this.playerSessions.set(client.sessionId, existingSession);
      if (existingSession.role === 'playerA') this.roleAssigned.playerA = client.sessionId;
      if (existingSession.role === 'playerB') this.roleAssigned.playerB = client.sessionId;

      const playerSchema = new PlayerStateSchema();
      playerSchema.id = client.sessionId;
      playerSchema.role = existingSession.role;
      playerSchema.connected = true;
      playerSchema.ready = true;
      playerSchema.choiceSubmitted = existingSession.hasChosen;
      playerSchema.reconnectToken = reconnectToken;
      this.state.players.set(client.sessionId, playerSchema);

      this.sendPrivateSync(client);
      this.broadcastSharedSync();
      return;
    }

    // New join
    let role: PlayerRole = 'playerA';
    if (this.roleAssigned.playerA && !this.roleAssigned.playerB) {
      role = 'playerB';
      this.roleAssigned.playerB = client.sessionId;
    } else if (!this.roleAssigned.playerA) {
      role = 'playerA';
      this.roleAssigned.playerA = client.sessionId;
    } else {
      throw new Error('Room is full');
    }

    const token = Math.random().toString(36).substring(2, 15);
    const newSession: PlayerSessionData = {
      id: client.sessionId,
      role,
      reconnectToken: token,
      traits: { ...INITIAL_TRAITS },
      privateFlags: {},
      hasChosen: false
    };

    this.playerSessions.set(client.sessionId, newSession);
    this.tokenToSessionMap.set(token, newSession);

    const pSchema = new PlayerStateSchema();
    pSchema.id = client.sessionId;
    pSchema.role = role;
    pSchema.connected = true;
    pSchema.ready = false;
    pSchema.reconnectToken = token;
    this.state.players.set(client.sessionId, pSchema);

    this.sendPrivateSync(client);
    this.broadcastSharedSync();
  }

  async onLeave(client: Client, consented: boolean) {
    const pSchema = this.state.players.get(client.sessionId);
    if (pSchema) {
      pSchema.connected = false;
    }
    this.broadcastSharedSync();

    if (!consented) {
      try {
        // Wait up to 30 seconds for reconnect
        await this.allowReconnection(client, 30);
        if (pSchema) {
          pSchema.connected = true;
          this.broadcastSharedSync();
        }
      } catch (e) {
        // Did not reconnect in time
      }
    }
  }

  private startGame() {
    this.state.status = 'PLAYING';
    this.state.currentSceneId = 'ch1_intro';
    this.state.chapter = 1;

    // Reset player choice statuses
    this.resetPlayerChoiceStates();
    this.broadcastPrivateSync();
    this.broadcastSharedSync();
  }

  private checkSceneResolution() {
    const sessionA = this.roleAssigned.playerA ? this.playerSessions.get(this.roleAssigned.playerA) : undefined;
    const sessionB = this.roleAssigned.playerB ? this.playerSessions.get(this.roleAssigned.playerB) : undefined;

    if (sessionA?.hasChosen && sessionB?.hasChosen) {
      // Resolve scene
      const prevSceneId = this.state.currentSceneId;
      const res = this.storyEngine.resolveScene(sessionA, sessionB);

      this.state.lastResolvedSceneId = prevSceneId;
      this.state.revealedChoiceA = sessionA.currentChoiceId || '';
      this.state.revealedChoiceB = sessionB.currentChoiceId || '';

      if (res.isFinished && res.result) {
        this.state.status = 'COMPLETED';
        this.state.shareCode = res.result.shareCode;
        this.completedResult = res.result;
        db.saveGame({
          id: this.roomId,
          roomCode: this.state.roomCode,
          status: 'COMPLETED',
          startedAt: new Date(this.storyEngine.startTime).toISOString(),
          endedAt: new Date().toISOString(),
          result: res.result
        });
      } else {
        // Transition to REVEAL state so players see each other's simultaneous choice and dialogue
        this.state.status = 'REVEAL';
      }

      // Reset for reveal acknowledgment
      sessionA.hasChosen = false;
      sessionB.hasChosen = false;

      this.broadcastPrivateSync();
      this.broadcastSharedSync();
    } else {
      this.broadcastSharedSync();
    }
  }

  private advanceToNextScene() {
    this.state.status = 'PLAYING';
    this.state.currentSceneId = this.storyEngine.currentSceneId;
    const sceneDef = this.storyEngine.getScene(this.state.currentSceneId);
    if (sceneDef) {
      this.state.chapter = sceneDef.chapter;
    }
    this.resetPlayerChoiceStates();
    this.broadcastPrivateSync();
    this.broadcastSharedSync();
  }

  private resetPlayerChoiceStates() {
    this.playerSessions.forEach((s) => {
      s.hasChosen = false;
      s.currentChoiceId = undefined;
    });
    this.state.players.forEach((p) => {
      p.choiceSubmitted = false;
    });
  }

  public getSharedStatePayload(): ClientSharedState {
    const sessionA = this.roleAssigned.playerA ? this.state.players.get(this.roleAssigned.playerA) : undefined;
    const sessionB = this.roleAssigned.playerB ? this.state.players.get(this.roleAssigned.playerB) : undefined;

    return {
      roomCode: this.state.roomCode,
      status: this.state.status as any,
      currentSceneId: this.state.currentSceneId,
      chapter: this.state.chapter,
      playerAConnected: Boolean(sessionA?.connected),
      playerBConnected: Boolean(sessionB?.connected),
      playerAReady: Boolean(sessionA?.ready),
      playerBReady: Boolean(sessionB?.ready),
      playerAChoiceSubmitted: Boolean(sessionA?.choiceSubmitted),
      playerBChoiceSubmitted: Boolean(sessionB?.choiceSubmitted),
      lastResolvedSceneId: this.state.lastResolvedSceneId,
      revealedChoiceA: this.state.revealedChoiceA,
      revealedChoiceB: this.state.revealedChoiceB,
      result: this.completedResult
    };
  }

  public broadcastSharedSync() {
    this.broadcast('SHARED_SYNC', this.getSharedStatePayload());
  }

  private sendPrivateSync(client: Client) {
    const session = this.playerSessions.get(client.sessionId);
    if (!session) return;

    const availableChoiceIds = this.storyEngine.getAvailableChoices(this.state.currentSceneId, session.role);

    const privateState: ClientPrivateState = {
      role: session.role,
      reconnectToken: session.reconnectToken,
      privateFlags: { ...session.privateFlags },
      hasChosen: session.hasChosen,
      myLastChoiceId: session.currentChoiceId
    };

    // Explicitly isolated payload
    client.send('PRIVATE_SYNC', {
      private: privateState,
      availableChoiceIds
    });
  }

  private broadcastPrivateSync() {
    this.clients.forEach((client) => {
      this.sendPrivateSync(client);
    });
  }
}
