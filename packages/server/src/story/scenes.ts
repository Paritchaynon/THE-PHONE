import { SceneDefinition } from '@between-us/shared';

export const SCENES: Record<string, SceneDefinition> = {
  // CHAPTER 1: FIRST IMPRESSION / THE DINNER
  'ch1_intro': {
    id: 'ch1_intro',
    chapter: 1,
    mode: 'narrative_only',
    nextSceneDefault: 'ch1_observation',
    ambientTrack: 'rain_soft'
  },
  'ch1_observation': {
    id: 'ch1_observation',
    chapter: 1,
    mode: 'simultaneous',
    // Player A notices Player B looks exhausted and distracted
    choicesA: [
      {
        id: 'a_ask_gently',
        traitEffects: { EMPATHY: +8, INTIMACY: +5 },
        relationshipEffects: { CLOSENESS: +6, UNDERSTANDING: +5 },
        revealedInResolution: true
      },
      {
        id: 'a_give_space',
        traitEffects: { SELF_PRESERVATION: +5, CONTROL: -5 },
        relationshipEffects: { CLOSENESS: -2, UNDERSTANDING: +2 },
        revealedInResolution: true
      },
      {
        id: 'a_demand_attention',
        traitEffects: { CONTROL: +10, EMPATHY: -5 },
        relationshipEffects: { CONFLICT: +8, CLOSENESS: -4 },
        revealedInResolution: true
      }
    ],
    // Player B is feeling overwhelmed by something at work/family
    choicesB: [
      {
        id: 'b_open_up',
        traitEffects: { HONESTY: +8, INTIMACY: +8, SELF_PRESERVATION: -5 },
        relationshipEffects: { VULNERABILITY: +10, CLOSENESS: +8 },
        revealedInResolution: true
      },
      {
        id: 'b_deflect_smile',
        traitEffects: { SELF_PRESERVATION: +8, HONESTY: -6 },
        relationshipEffects: { VULNERABILITY: -5, UNDERSTANDING: -4 },
        revealedInResolution: true
      },
      {
        id: 'b_show_irritation',
        traitEffects: { CONTROL: +6, FORGIVENESS: -5 },
        relationshipEffects: { CONFLICT: +10, CLOSENESS: -6 },
        revealedInResolution: true
      }
    ],
    resolutionRuleId: 'res_ch1_observation',
    nextSceneDefault: 'ch2_phone_vibration'
  },

  // CHAPTER 2 & 3: THE SECRET / ASYMMETRIC PHONE MOMENT
  'ch2_phone_vibration': {
    id: 'ch2_phone_vibration',
    chapter: 2,
    mode: 'narrative_only',
    nextSceneDefault: 'ch2_phone_choice',
    ambientTrack: 'tension_subtle'
  },
  'ch2_phone_choice': {
    id: 'ch2_phone_choice',
    chapter: 2,
    mode: 'simultaneous',
    // ASYMMETRIC INFORMATION:
    // Player A sees partner stepped away into the kitchen, phone buzzes on table with a preview: "I miss how we used to talk..."
    // Player B is in kitchen, realizing they forgot their phone, knowing an old friend/ex sent a text they haven't explained yet.
    choicesA: [
      {
        id: 'a_peek_phone',
        traitEffects: { TRUST: -12, CONTROL: +10, SELF_PRESERVATION: +6 },
        relationshipEffects: { TRUST: -15, CONFLICT: +12 },
        privateFlagEffects: { a_peeked_phone: true },
        revealedInResolution: true
      },
      {
        id: 'a_turn_face_down',
        traitEffects: { TRUST: +10, CONTROL: -8, LOYALTY: +6 },
        relationshipEffects: { TRUST: +10, VULNERABILITY: +5 },
        privateFlagEffects: { a_respected_privacy: true },
        revealedInResolution: true
      },
      {
        id: 'a_call_out_partner',
        traitEffects: { HONESTY: +10, EMPATHY: +4 },
        relationshipEffects: { UNDERSTANDING: +6, CONFLICT: +4 },
        privateFlagEffects: { a_called_out: true },
        revealedInResolution: true
      }
    ],
    choicesB: [
      {
        id: 'b_hurry_hide',
        traitEffects: { SELF_PRESERVATION: +12, HONESTY: -10, TRUST: -8 },
        relationshipEffects: { CONFLICT: +8, TRUST: -10 },
        privateFlagEffects: { b_attempted_hide: true },
        revealedInResolution: true
      },
      {
        id: 'b_explain_voluntarily',
        traitEffects: { HONESTY: +14, INTIMACY: +10, SELF_PRESERVATION: -8 },
        relationshipEffects: { VULNERABILITY: +15, CLOSENESS: +10, TRUST: +8 },
        privateFlagEffects: { b_confessed_early: true },
        revealedInResolution: true
      },
      {
        id: 'b_act_defensive',
        traitEffects: { CONTROL: +10, FORGIVENESS: -8, SELF_PRESERVATION: +10 },
        relationshipEffects: { CONFLICT: +15, CLOSENESS: -10 },
        privateFlagEffects: { b_defensive: true },
        revealedInResolution: true
      }
    ],
    resolutionRuleId: 'res_ch2_phone',
    nextSceneDefault: 'ch3_confrontation'
  },

  // CHAPTER 4: THE CONFRONTATION
  'ch3_confrontation': {
    id: 'ch3_confrontation',
    chapter: 3,
    mode: 'simultaneous',
    choicesA: [
      {
        id: 'a_seek_truth',
        traitEffects: { HONESTY: +10, CONTROL: +4, INTIMACY: +6 },
        relationshipEffects: { UNDERSTANDING: +8, CONFLICT: +6 },
        revealedInResolution: true
      },
      {
        id: 'a_express_hurt',
        traitEffects: { EMPATHY: +8, INTIMACY: +8, SELF_PRESERVATION: -6 },
        relationshipEffects: { VULNERABILITY: +12, CLOSENESS: +8 },
        revealedInResolution: true
      },
      {
        id: 'a_shut_down',
        traitEffects: { SELF_PRESERVATION: +14, TRUST: -10, FORGIVENESS: -8 },
        relationshipEffects: { CLOSENESS: -14, CONFLICT: +10 },
        revealedInResolution: true
      }
    ],
    choicesB: [
      {
        id: 'b_apologize_fully',
        traitEffects: { FORGIVENESS: +10, HONESTY: +10, EMPATHY: +10 },
        relationshipEffects: { VULNERABILITY: +14, CLOSENESS: +10, CONFLICT: -8 },
        revealedInResolution: true
      },
      {
        id: 'b_justify_actions',
        traitEffects: { CONTROL: +8, SELF_PRESERVATION: +8, EMPATHY: -6 },
        relationshipEffects: { CONFLICT: +12, UNDERSTANDING: -8 },
        revealedInResolution: true
      },
      {
        id: 'b_plead_understanding',
        traitEffects: { INTIMACY: +10, EMPATHY: +8 },
        relationshipEffects: { VULNERABILITY: +10, CLOSENESS: +6 },
        revealedInResolution: true
      }
    ],
    resolutionRuleId: 'res_ch3_confrontation',
    nextSceneDefault: 'ch5_vulnerability'
  },

  // CHAPTER 5: THE VULNERABILITY & PAST
  'ch5_vulnerability': {
    id: 'ch5_vulnerability',
    chapter: 5,
    mode: 'simultaneous',
    choicesA: [
      {
        id: 'a_share_deepest_fear',
        traitEffects: { INTIMACY: +16, EMPATHY: +10, SELF_PRESERVATION: -10 },
        relationshipEffects: { VULNERABILITY: +20, CLOSENESS: +15 },
        revealedInResolution: true
      },
      {
        id: 'a_stay_guarded',
        traitEffects: { SELF_PRESERVATION: +12, CONTROL: +6 },
        relationshipEffects: { VULNERABILITY: -8, CLOSENESS: -5 },
        revealedInResolution: true
      }
    ],
    choicesB: [
      {
        id: 'b_share_childhood_wound',
        traitEffects: { INTIMACY: +16, EMPATHY: +10, SELF_PRESERVATION: -10 },
        relationshipEffects: { VULNERABILITY: +20, CLOSENESS: +15 },
        revealedInResolution: true
      },
      {
        id: 'b_change_subject',
        traitEffects: { SELF_PRESERVATION: +12, CONTROL: +6 },
        relationshipEffects: { VULNERABILITY: -8, CLOSENESS: -5 },
        revealedInResolution: true
      }
    ],
    nextSceneDefault: 'ch6_breaking_point'
  },

  // CHAPTER 6: BREAKING POINT / SACRIFICE
  'ch6_breaking_point': {
    id: 'ch6_breaking_point',
    chapter: 6,
    mode: 'simultaneous',
    choicesA: [
      {
        id: 'a_willing_compromise',
        traitEffects: { FORGIVENESS: +15, EMPATHY: +12, CONTROL: -10 },
        relationshipEffects: { UNDERSTANDING: +15, CONFLICT: -15, CLOSENESS: +12 },
        revealedInResolution: true
      },
      {
        id: 'a_hold_ground',
        traitEffects: { CONTROL: +14, SELF_PRESERVATION: +10, FORGIVENESS: -10 },
        relationshipEffects: { CONFLICT: +20, CLOSENESS: -12 },
        revealedInResolution: true
      }
    ],
    choicesB: [
      {
        id: 'b_let_go_pride',
        traitEffects: { FORGIVENESS: +15, EMPATHY: +12, CONTROL: -10 },
        relationshipEffects: { UNDERSTANDING: +15, CONFLICT: -15, CLOSENESS: +12 },
        revealedInResolution: true
      },
      {
        id: 'b_demand_validation',
        traitEffects: { CONTROL: +14, SELF_PRESERVATION: +10, FORGIVENESS: -10 },
        relationshipEffects: { CONFLICT: +20, CLOSENESS: -12 },
        revealedInResolution: true
      }
    ],
    nextSceneDefault: 'ch7_final_question'
  },

  // CHAPTER 7: THE LAST QUESTION
  'ch7_final_question': {
    id: 'ch7_final_question',
    chapter: 7,
    mode: 'simultaneous',
    // A final private question that seals the relationship outcome
    choicesA: [
      {
        id: 'a_choose_them_fully',
        traitEffects: { LOYALTY: +18, INTIMACY: +16, FORGIVENESS: +15, TRUST: +15 },
        relationshipEffects: { TRUST: +20, CLOSENESS: +20, VULNERABILITY: +15 },
        revealedInResolution: true
      },
      {
        id: 'a_choose_cautious_healing',
        traitEffects: { HONESTY: +12, EMPATHY: +10, SELF_PRESERVATION: +6 },
        relationshipEffects: { UNDERSTANDING: +15, TRUST: +10 },
        revealedInResolution: true
      },
      {
        id: 'a_let_go_walk_away',
        traitEffects: { SELF_PRESERVATION: +20, INTIMACY: -15, TRUST: -15 },
        relationshipEffects: { CLOSENESS: -25, CONFLICT: +10 },
        revealedInResolution: true
      }
    ],
    choicesB: [
      {
        id: 'b_choose_them_fully',
        traitEffects: { LOYALTY: +18, INTIMACY: +16, FORGIVENESS: +15, TRUST: +15 },
        relationshipEffects: { TRUST: +20, CLOSENESS: +20, VULNERABILITY: +15 },
        revealedInResolution: true
      },
      {
        id: 'b_choose_cautious_healing',
        traitEffects: { HONESTY: +12, EMPATHY: +10, SELF_PRESERVATION: +6 },
        relationshipEffects: { UNDERSTANDING: +15, TRUST: +10 },
        revealedInResolution: true
      },
      {
        id: 'b_let_go_walk_away',
        traitEffects: { SELF_PRESERVATION: +20, INTIMACY: -15, TRUST: -15 },
        relationshipEffects: { CLOSENESS: -25, CONFLICT: +10 },
        revealedInResolution: true
      }
    ],
    nextSceneDefault: 'GAME_END'
  }
};
