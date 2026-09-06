"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_RELATIONSHIP = exports.INITIAL_TRAITS = void 0;
exports.clampTrait = clampTrait;
exports.INITIAL_TRAITS = {
    TRUST: 50,
    CONTROL: 50,
    EMPATHY: 50,
    HONESTY: 50,
    LOYALTY: 50,
    SELF_PRESERVATION: 50,
    FORGIVENESS: 50,
    INTIMACY: 50
};
exports.INITIAL_RELATIONSHIP = {
    TRUST: 50,
    CLOSENESS: 50,
    CONFLICT: 20,
    UNDERSTANDING: 50,
    VULNERABILITY: 50
};
function clampTrait(val) {
    return Math.max(0, Math.min(100, Math.round(val)));
}
