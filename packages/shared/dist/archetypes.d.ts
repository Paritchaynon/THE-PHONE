import { ArchetypeId, CoupleDynamicId, HiddenTraitKey, RelationshipDimKey } from './types';
export interface ArchetypeScoreWeights {
    weights: Partial<Record<HiddenTraitKey, number>>;
    negativeWeights?: Partial<Record<HiddenTraitKey, number>>;
}
export declare const ARCHETYPE_CRITERIA: Record<ArchetypeId, ArchetypeScoreWeights>;
export declare function calculateArchetype(traits: Record<HiddenTraitKey, number>): ArchetypeId;
export declare function calculateCoupleDynamic(archetypeA: ArchetypeId, archetypeB: ArchetypeId, relationship: Record<RelationshipDimKey, number>): CoupleDynamicId;
