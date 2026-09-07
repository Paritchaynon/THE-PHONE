import { StoryEngine, PlayerSessionData } from '../engine/StoryEngine';
import { INITIAL_TRAITS } from '@between-us/shared';

describe('Authoritative StoryEngine & State Isolation', () => {
  let engine: StoryEngine;
  let playerA: PlayerSessionData;
  let playerB: PlayerSessionData;

  beforeEach(() => {
    engine = new StoryEngine('ch1_intro');
    playerA = {
      id: 'pA',
      role: 'playerA',
      reconnectToken: 'token_a',
      traits: { ...INITIAL_TRAITS },
      privateFlags: {},
      hasChosen: false
    };
    playerB = {
      id: 'pB',
      role: 'playerB',
      reconnectToken: 'token_b',
      traits: { ...INITIAL_TRAITS },
      privateFlags: {},
      hasChosen: false
    };
  });

  test('Narrative only scene advances on continue', () => {
    expect(engine.currentSceneId).toBe('ch1_intro');
    const choicesA = engine.getAvailableChoices(engine.currentSceneId, 'playerA');
    expect(choicesA).toEqual(['continue']);

    engine.recordChoice(playerA, 'continue');
    engine.recordChoice(playerB, 'continue');

    const res = engine.resolveScene(playerA, playerB);
    expect(res.nextSceneId).toBe('ch1_observation');
    expect(engine.currentSceneId).toBe('ch1_observation');
  });

  test('Simultaneous choices strictly filter per player role', () => {
    engine.currentSceneId = 'ch1_observation';
    const choicesA = engine.getAvailableChoices('ch1_observation', 'playerA');
    const choicesB = engine.getAvailableChoices('ch1_observation', 'playerB');

    // Player A should get player A choices only
    expect(choicesA).toContain('a_ask_gently');
    expect(choicesA).not.toContain('b_open_up');

    // Player B should get player B choices only
    expect(choicesB).toContain('b_open_up');
    expect(choicesB).not.toContain('a_ask_gently');

    // Make choices
    engine.recordChoice(playerA, 'a_ask_gently');
    engine.recordChoice(playerB, 'b_open_up');

    const res = engine.resolveScene(playerA, playerB);
    expect(res.nextSceneId).toBe('ch2_phone_vibration');

    // Verify trait modifications occurred
    expect(playerA.traits.EMPATHY).toBeGreaterThan(INITIAL_TRAITS.EMPATHY);
    expect(playerB.traits.HONESTY).toBeGreaterThan(INITIAL_TRAITS.HONESTY);
    expect(engine.relationship.CLOSENESS).toBeGreaterThan(50);
  });

  test('Final result computes archetypes, couple dynamic, and ending', () => {
    // Simulate high intimacy and honesty
    playerA.traits.HONESTY = 85;
    playerA.traits.INTIMACY = 80;
    playerA.traits.EMPATHY = 75;

    playerB.traits.TRUST = 90;
    playerB.traits.FORGIVENESS = 85;
    playerB.traits.EMPATHY = 80;

    engine.relationship.TRUST = 85;
    engine.relationship.CLOSENESS = 80;
    engine.relationship.UNDERSTANDING = 80;

    const result = engine.computeFinalResult(playerA, playerB);
    expect(result.archetypeA).toBe('THE_SEEKER');
    expect(result.archetypeB).toBe('THE_ANCHOR');
    expect(result.coupleDynamic).toBeDefined();
    expect(result.ending).toBe('TOGETHER');
    expect(result.shareCode.length).toBe(6);
  });

  test('Action-reaction mode (ch2_phone_choice) triggers with interactive hotspots', () => {
    engine.currentSceneId = 'ch2_phone_choice';
    const sceneDef = engine.getScene('ch2_phone_choice');
    expect(sceneDef.mode).toBe('action_reaction');
    expect(sceneDef.initiatorRole).toBe('playerA');
    expect(sceneDef.hotspots).toBeDefined();
    expect(sceneDef.hotspots?.length).toBeGreaterThan(0);

    // Player A interacts with glowing phone
    const choicesA = engine.getAvailableChoices('ch2_phone_choice', 'playerA');
    expect(choicesA).toContain('a_peek_phone');
    engine.recordChoice(playerA, 'a_peek_phone');

    // Player B reacts to Player A's action
    const choicesB = engine.getAvailableChoices('ch2_phone_choice', 'playerB');
    expect(choicesB).toContain('b_hurry_hide');
    engine.recordChoice(playerB, 'b_hurry_hide');

    const res = engine.resolveScene(playerA, playerB);
    expect(res.nextSceneId).toBe('ch3_confrontation');
    expect(playerA.privateFlags.a_peeked_phone).toBe(true);
    expect(playerB.privateFlags.b_attempted_hide).toBe(true);
  });
});
