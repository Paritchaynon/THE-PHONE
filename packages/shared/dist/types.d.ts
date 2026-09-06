export type PlayerRole = 'playerA' | 'playerB';
export type HiddenTraitKey = 'TRUST' | 'CONTROL' | 'EMPATHY' | 'HONESTY' | 'LOYALTY' | 'SELF_PRESERVATION' | 'FORGIVENESS' | 'INTIMACY';
export type RelationshipDimKey = 'TRUST' | 'CLOSENESS' | 'CONFLICT' | 'UNDERSTANDING' | 'VULNERABILITY';
export type ArchetypeId = 'THE_GUARDIAN' | 'THE_SEEKER' | 'THE_ANCHOR' | 'THE_MIRROR' | 'THE_FREE_SOUL' | 'THE_WALL' | 'THE_HEALER' | 'THE_FIRE';
export type CoupleDynamicId = 'THE_BALANCED_PAIR' | 'THE_CHASER_AND_THE_WALL' | 'THE_MIRROR_AND_THE_MIRROR' | 'THE_FIRE_AND_THE_WATER' | 'THE_GUARDIAN_AND_THE_SEEKER' | 'THE_ANCHOR_AND_THE_FREE_SOUL' | 'THE_HEALERS' | 'THE_STRANGERS';
export type EndingId = 'TOGETHER' | 'REBUILD' | 'HONEST_LOVERS' | 'QUIET_LOVERS' | 'BEST_FRIENDS' | 'UNFINISHED' | 'ONE_LAST_CHANCE' | 'FORGIVEN' | 'MISUNDERSTOOD' | 'DISTANT' | 'SEPARATE' | 'STRANGERS';
export type SupportedLocale = 'th' | 'en';
export interface TraitScoreMap {
    [key: string]: number;
}
export interface ChoiceDefinition {
    id: string;
    traitEffects?: Partial<Record<HiddenTraitKey, number>>;
    relationshipEffects?: Partial<Record<RelationshipDimKey, number>>;
    sharedFlagEffects?: Record<string, boolean | string | number>;
    privateFlagEffects?: Record<string, boolean | string | number>;
    nextScene?: string;
    revealedInResolution?: boolean;
}
export type DecisionMode = 'simultaneous' | 'single_player' | 'narrative_only';
export interface SceneDefinition {
    id: string;
    chapter: number;
    mode: DecisionMode;
    activeRole?: PlayerRole;
    choicesA?: ChoiceDefinition[];
    choicesB?: ChoiceDefinition[];
    resolutionRuleId?: string;
    nextSceneDefault?: string;
    ambientTrack?: string;
}
export interface GameResultSummary {
    shareCode: string;
    archetypeA: ArchetypeId;
    archetypeB: ArchetypeId;
    coupleDynamic: CoupleDynamicId;
    ending: EndingId;
    durationSeconds: number;
    decisionCount: number;
    agreementRate: number;
    aggregateStats: {
        trust: number;
        honesty: number;
        empathy: number;
        vulnerability: number;
        closeness: number;
    };
    completedAt: string;
}
export interface ClientPrivateState {
    role: PlayerRole;
    reconnectToken: string;
    privateFlags: Record<string, any>;
    hasChosen: boolean;
    myLastChoiceId?: string;
}
export interface ClientSharedState {
    roomCode: string;
    status: 'LOBBY' | 'PLAYING' | 'REVEAL' | 'COMPLETED';
    currentSceneId: string;
    chapter: number;
    playerAConnected: boolean;
    playerBConnected: boolean;
    playerAReady: boolean;
    playerBReady: boolean;
    playerAChoiceSubmitted: boolean;
    playerBChoiceSubmitted: boolean;
    playerAContinued?: boolean;
    playerBContinued?: boolean;
    lastResolvedSceneId?: string;
    revealedChoiceA?: string;
    revealedChoiceB?: string;
    result?: GameResultSummary;
}
export interface ClientSyncPayload {
    shared: ClientSharedState;
    private: ClientPrivateState;
    availableChoiceIds: string[];
}
