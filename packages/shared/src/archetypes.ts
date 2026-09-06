import { ArchetypeId, CoupleDynamicId, HiddenTraitKey, RelationshipDimKey } from './types';

export interface ArchetypeScoreWeights {
  weights: Partial<Record<HiddenTraitKey, number>>;
  negativeWeights?: Partial<Record<HiddenTraitKey, number>>;
}

export const ARCHETYPE_CRITERIA: Record<ArchetypeId, ArchetypeScoreWeights> = {
  THE_GUARDIAN: {
    weights: { LOYALTY: 2.0, CONTROL: 1.5, SELF_PRESERVATION: 1.2 },
    negativeWeights: { INTIMACY: 0.5 }
  },
  THE_SEEKER: {
    weights: { HONESTY: 2.0, INTIMACY: 1.5, EMPATHY: 1.0 },
    negativeWeights: { SELF_PRESERVATION: 0.8 }
  },
  THE_ANCHOR: {
    weights: { TRUST: 2.0, FORGIVENESS: 1.8, EMPATHY: 1.2 },
    negativeWeights: { CONTROL: 1.0 }
  },
  THE_MIRROR: {
    weights: { EMPATHY: 2.0, INTIMACY: 1.2, TRUST: 1.0 }
  },
  THE_FREE_SOUL: {
    weights: { SELF_PRESERVATION: 1.8, INTIMACY: 1.2 },
    negativeWeights: { CONTROL: 2.0 }
  },
  THE_WALL: {
    weights: { SELF_PRESERVATION: 2.2, CONTROL: 1.2 },
    negativeWeights: { INTIMACY: 1.5, HONESTY: 1.0 }
  },
  THE_HEALER: {
    weights: { FORGIVENESS: 2.2, EMPATHY: 1.8, TRUST: 1.0 },
    negativeWeights: { CONTROL: 1.2 }
  },
  THE_FIRE: {
    weights: { INTIMACY: 1.8, HONESTY: 1.5 },
    negativeWeights: { SELF_PRESERVATION: 1.0, FORGIVENESS: 0.8 }
  }
};

export function calculateArchetype(traits: Record<HiddenTraitKey, number>): ArchetypeId {
  let bestArchetype: ArchetypeId = 'THE_ANCHOR';
  let bestScore = -Infinity;

  for (const [archId, criteria] of Object.entries(ARCHETYPE_CRITERIA) as [ArchetypeId, ArchetypeScoreWeights][]) {
    let score = 0;
    if (criteria.weights) {
      for (const [t, w] of Object.entries(criteria.weights) as [HiddenTraitKey, number][]) {
        score += (traits[t] ?? 50) * w;
      }
    }
    if (criteria.negativeWeights) {
      for (const [t, w] of Object.entries(criteria.negativeWeights) as [HiddenTraitKey, number][]) {
        score -= (traits[t] ?? 50) * w;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestArchetype = archId;
    }
  }

  return bestArchetype;
}

export function calculateCoupleDynamic(
  archetypeA: ArchetypeId,
  archetypeB: ArchetypeId,
  relationship: Record<RelationshipDimKey, number>
): CoupleDynamicId {
  const set = new Set([archetypeA, archetypeB]);

  // Pair-based rules
  if (archetypeA === archetypeB && archetypeA === 'THE_MIRROR') return 'THE_MIRROR_AND_THE_MIRROR';
  if (archetypeA === archetypeB && archetypeA === 'THE_HEALER') return 'THE_HEALERS';
  if (set.has('THE_FIRE') && (set.has('THE_ANCHOR') || set.has('THE_HEALER'))) return 'THE_FIRE_AND_THE_WATER';
  if (set.has('THE_SEEKER') && set.has('THE_WALL')) return 'THE_CHASER_AND_THE_WALL';
  if (set.has('THE_GUARDIAN') && set.has('THE_SEEKER')) return 'THE_GUARDIAN_AND_THE_SEEKER';
  if (set.has('THE_ANCHOR') && set.has('THE_FREE_SOUL')) return 'THE_ANCHOR_AND_THE_FREE_SOUL';

  // Relationship threshold overrides
  if (relationship.TRUST < 35 && relationship.CLOSENESS < 35) {
    return 'THE_STRANGERS';
  }
  if (relationship.TRUST >= 60 && relationship.UNDERSTANDING >= 60) {
    return 'THE_BALANCED_PAIR';
  }

  return 'THE_BALANCED_PAIR';
}
