import {
  HiddenTraitKey,
  RelationshipDimKey,
  INITIAL_TRAITS,
  INITIAL_RELATIONSHIP,
  clampTrait,
  calculateArchetype,
  calculateCoupleDynamic,
  calculateEnding,
  GameResultSummary
} from '@between-us/shared';
import { SCENES } from '../story/scenes';

export interface PlayerSessionData {
  id: string;
  role: 'playerA' | 'playerB';
  reconnectToken: string;
  traits: Record<HiddenTraitKey, number>;
  privateFlags: Record<string, any>;
  hasChosen: boolean;
  currentChoiceId?: string;
}

export class StoryEngine {
  public relationship: Record<RelationshipDimKey, number>;
  public sharedFlags: Record<string, any>;
  public currentSceneId: string;
  public status: 'LOBBY' | 'PLAYING' | 'REVEAL' | 'COMPLETED';
  public decisionsHistory: Array<{
    sceneId: string;
    choiceA?: string;
    choiceB?: string;
    timestamp: number;
    agreedApproach: boolean;
  }> = [];
  public startTime: number = Date.now();

  constructor(initialSceneId: string = 'ch1_intro') {
    this.currentSceneId = initialSceneId;
    this.relationship = { ...INITIAL_RELATIONSHIP };
    this.sharedFlags = {};
    this.status = 'LOBBY';
  }

  public getScene(sceneId: string) {
    return SCENES[sceneId];
  }

  public getAvailableChoices(sceneId: string, role: 'playerA' | 'playerB'): string[] {
    const scene = SCENES[sceneId];
    if (!scene) return [];
    if (scene.mode === 'narrative_only') return ['continue'];

    const choices = role === 'playerA' ? scene.choicesA : scene.choicesB;
    return (choices || []).map(c => c.id);
  }

  public recordChoice(
    player: PlayerSessionData,
    choiceId: string
  ): boolean {
    const scene = SCENES[this.currentSceneId];
    if (!scene) return false;

    if (scene.mode === 'narrative_only') {
      player.hasChosen = true;
      player.currentChoiceId = 'continue';
      return true;
    }

    const choices = player.role === 'playerA' ? scene.choicesA : scene.choicesB;
    const choiceDef = choices?.find(c => c.id === choiceId);
    if (!choiceDef) return false;

    player.hasChosen = true;
    player.currentChoiceId = choiceId;
    return true;
  }

  public resolveScene(playerA: PlayerSessionData, playerB: PlayerSessionData): {
    nextSceneId: string;
    isFinished: boolean;
    result?: GameResultSummary;
  } {
    const scene = SCENES[this.currentSceneId];
    if (!scene) throw new Error(`Scene not found: ${this.currentSceneId}`);

    // Apply trait and relationship effects
    let agreed = false;

    if (scene.mode === 'narrative_only') {
      agreed = true;
    } else {
      const choiceA = scene.choicesA?.find(c => c.id === playerA.currentChoiceId);
      const choiceB = scene.choicesB?.find(c => c.id === playerB.currentChoiceId);

      if (choiceA?.traitEffects) {
        for (const [t, diff] of Object.entries(choiceA.traitEffects) as [HiddenTraitKey, number][]) {
          playerA.traits[t] = clampTrait(playerA.traits[t] + diff);
        }
      }
      if (choiceA?.relationshipEffects) {
        for (const [r, diff] of Object.entries(choiceA.relationshipEffects) as [RelationshipDimKey, number][]) {
          this.relationship[r] = clampTrait(this.relationship[r] + diff);
        }
      }
      if (choiceA?.privateFlagEffects) {
        Object.assign(playerA.privateFlags, choiceA.privateFlagEffects);
      }

      if (choiceB?.traitEffects) {
        for (const [t, diff] of Object.entries(choiceB.traitEffects) as [HiddenTraitKey, number][]) {
          playerB.traits[t] = clampTrait(playerB.traits[t] + diff);
        }
      }
      if (choiceB?.relationshipEffects) {
        for (const [r, diff] of Object.entries(choiceB.relationshipEffects) as [RelationshipDimKey, number][]) {
          this.relationship[r] = clampTrait(this.relationship[r] + diff);
        }
      }
      if (choiceB?.privateFlagEffects) {
        Object.assign(playerB.privateFlags, choiceB.privateFlagEffects);
      }

      // Check agreement heuristic (e.g. both positive or both protective)
      agreed = Boolean(
        (choiceA?.id.includes('gently') && choiceB?.id.includes('open')) ||
        (choiceA?.id.includes('turn') && choiceB?.id.includes('explain')) ||
        (choiceA?.id.includes('compromise') && choiceB?.id.includes('let_go')) ||
        (choiceA?.id.includes('choose_them') && choiceB?.id.includes('choose_them'))
      );
    }

    this.decisionsHistory.push({
      sceneId: this.currentSceneId,
      choiceA: playerA.currentChoiceId,
      choiceB: playerB.currentChoiceId,
      timestamp: Date.now(),
      agreedApproach: agreed
    });

    const nextSceneId = scene.nextSceneDefault || 'GAME_END';

    if (nextSceneId === 'GAME_END') {
      this.status = 'COMPLETED';
      const result = this.computeFinalResult(playerA, playerB);
      return { nextSceneId, isFinished: true, result };
    }

    this.currentSceneId = nextSceneId;
    return { nextSceneId, isFinished: false };
  }

  public computeFinalResult(playerA: PlayerSessionData, playerB: PlayerSessionData): GameResultSummary {
    const archetypeA = calculateArchetype(playerA.traits);
    const archetypeB = calculateArchetype(playerB.traits);
    const coupleDynamic = calculateCoupleDynamic(archetypeA, archetypeB, this.relationship);
    const ending = calculateEnding(this.relationship, playerA.traits, playerB.traits, {
      ...this.sharedFlags,
      ...playerA.privateFlags,
      ...playerB.privateFlags
    });

    const agreementCount = this.decisionsHistory.filter(d => d.agreedApproach).length;
    const totalDecisions = this.decisionsHistory.length;
    const agreementRate = totalDecisions > 0 ? Math.round((agreementCount / totalDecisions) * 100) : 50;

    return {
      shareCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      archetypeA,
      archetypeB,
      coupleDynamic,
      ending,
      durationSeconds: Math.round((Date.now() - this.startTime) / 1000),
      decisionCount: totalDecisions,
      agreementRate,
      aggregateStats: {
        trust: Math.round((playerA.traits.TRUST + playerB.traits.TRUST + this.relationship.TRUST) / 3),
        honesty: Math.round((playerA.traits.HONESTY + playerB.traits.HONESTY) / 2),
        empathy: Math.round((playerA.traits.EMPATHY + playerB.traits.EMPATHY) / 2),
        vulnerability: this.relationship.VULNERABILITY,
        closeness: this.relationship.CLOSENESS
      },
      completedAt: new Date().toISOString()
    };
  }
}
