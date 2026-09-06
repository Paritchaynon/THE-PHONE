import { Schema, type, MapSchema } from '@colyseus/schema';

export class PlayerStateSchema extends Schema {
  @type("string") id: string = "";
  @type("string") role: string = ""; // "playerA" | "playerB"
  @type("boolean") connected: boolean = false;
  @type("boolean") ready: boolean = false;
  @type("boolean") choiceSubmitted: boolean = false;
  @type("string") reconnectToken: string = "";
}

export class GameRoomStateSchema extends Schema {
  @type("string") roomCode: string = "";
  @type("string") status: string = "LOBBY"; // LOBBY, PLAYING, REVEAL, COMPLETED
  @type("string") currentSceneId: string = "ch1_intro";
  @type("number") chapter: number = 1;
  @type({ map: PlayerStateSchema }) players = new MapSchema<PlayerStateSchema>();
  
  // Public reveal fields
  @type("string") revealedChoiceA: string = "";
  @type("string") revealedChoiceB: string = "";
  @type("string") lastResolvedSceneId: string = "";
  @type("string") shareCode: string = "";
}
