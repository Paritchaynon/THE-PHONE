import { HiddenTraitKey, RelationshipDimKey } from './types';

export const INITIAL_TRAITS: Record<HiddenTraitKey, number> = {
  TRUST: 50,
  CONTROL: 50,
  EMPATHY: 50,
  HONESTY: 50,
  LOYALTY: 50,
  SELF_PRESERVATION: 50,
  FORGIVENESS: 50,
  INTIMACY: 50
};

export const INITIAL_RELATIONSHIP: Record<RelationshipDimKey, number> = {
  TRUST: 50,
  CLOSENESS: 50,
  CONFLICT: 20,
  UNDERSTANDING: 50,
  VULNERABILITY: 50
};

export function clampTrait(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}
