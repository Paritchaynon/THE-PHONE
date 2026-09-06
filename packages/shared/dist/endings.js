"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateEnding = calculateEnding;
function calculateEnding(relationship, traitsA, traitsB, flags) {
    const avgTrust = (traitsA.TRUST + traitsB.TRUST) / 2;
    const avgHonesty = (traitsA.HONESTY + traitsB.HONESTY) / 2;
    const relTrust = relationship.TRUST;
    const relCloseness = relationship.CLOSENESS;
    const relConflict = relationship.CONFLICT;
    // Severe disconnect
    if (relTrust < 25 && relConflict > 65) {
        return 'SEPARATE';
    }
    if (relCloseness < 25 && relTrust < 30) {
        return 'STRANGERS';
    }
    if (relConflict > 60 && relCloseness < 40) {
        return 'DISTANT';
    }
    if (flags.misunderstood || (relConflict > 50 && relationship.UNDERSTANDING < 35)) {
        return 'MISUNDERSTOOD';
    }
    // Positive branch
    if (relTrust >= 75 && relCloseness >= 70 && avgHonesty >= 65) {
        return 'TOGETHER';
    }
    if (avgHonesty >= 75 && relTrust >= 60) {
        return 'HONEST_LOVERS';
    }
    if (relationship.VULNERABILITY >= 65 && relationship.UNDERSTANDING >= 65) {
        return 'QUIET_LOVERS';
    }
    if (relCloseness >= 60 && relConflict < 35) {
        return 'BEST_FRIENDS';
    }
    if (flags.rebuilding || (relConflict > 45 && relTrust >= 50)) {
        return 'REBUILD';
    }
    if (traitsA.FORGIVENESS >= 65 || traitsB.FORGIVENESS >= 65) {
        return 'FORGIVEN';
    }
    if (relTrust >= 40 && relCloseness >= 40) {
        return 'ONE_LAST_CHANCE';
    }
    return 'UNFINISHED';
}
