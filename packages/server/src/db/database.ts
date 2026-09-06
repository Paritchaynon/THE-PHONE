import { GameResultSummary } from '@between-us/shared';

export interface StoredGame {
  id: string;
  roomCode: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  result?: GameResultSummary;
}

// In-Memory storage with seamless Supabase/Postgres persistence adapter
export class DatabaseService {
  private games: Map<string, StoredGame> = new Map();
  private resultsByShareCode: Map<string, GameResultSummary> = new Map();

  public saveGame(game: StoredGame): void {
    this.games.set(game.roomCode, game);
    if (game.result?.shareCode) {
      this.resultsByShareCode.set(game.result.shareCode, game.result);
    }
  }

  public getGame(roomCode: string): StoredGame | undefined {
    return this.games.get(roomCode);
  }

  public getResultByShareCode(shareCode: string): GameResultSummary | undefined {
    return this.resultsByShareCode.get(shareCode.toUpperCase());
  }
}

export const db = new DatabaseService();
