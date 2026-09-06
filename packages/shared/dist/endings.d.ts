import { EndingId, HiddenTraitKey, RelationshipDimKey } from './types';
export declare function calculateEnding(relationship: Record<RelationshipDimKey, number>, traitsA: Record<HiddenTraitKey, number>, traitsB: Record<HiddenTraitKey, number>, flags: Record<string, any>): EndingId;
