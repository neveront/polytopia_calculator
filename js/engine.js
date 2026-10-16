/**
 * Polytopia Combat Engine
 * Based on the official deterministic Battle of Polytopia damage formula.
 */

export const DEFENSE_BONUSES = {
  none: { id: 'none', label: 'No Bonus (1.0x)', multiplier: 1.0, poisonedMultiplier: 0.5 },
  terrain: { id: 'terrain', label: 'Terrain / Forest / Mountain / Water (1.5x)', multiplier: 1.5, poisonedMultiplier: 0.7 },
  wall: { id: 'wall', label: 'City Wall (4.0x)', multiplier: 4.0, poisonedMultiplier: 2.0 },
};

/**
 * Checks if a unit possesses the Fortify skill
 */
export function hasFortifySkill(unit) {
  if (unit.hasFortify !== undefined) return Boolean(unit.hasFortify);
  if (Array.isArray(unit.skills)) return unit.skills.includes('Fortify');
  return false;
}

/**
 * Calculates a single combat interaction between Attacker and Defender.
 * 
 * @param {Object} attacker 
 * @param {number} attacker.attack - Unit base attack stat
 * @param {number} attacker.currentHp - Attacker current HP
 * @param {number} attacker.maxHp - Attacker max HP (e.g. 10, or 15 if veteran)
 * @param {number} [attacker.range=1] - Attacker attack range
 * @param {boolean} [attacker.isPoisoned=false]
 * 
 * @param {Object} defender
 * @param {number} defender.defense - Unit base defense stat
 * @param {number} defender.currentHp - Defender current HP
 * @param {number} defender.maxHp - Defender max HP
 * @param {number} [defender.range=1] - Defender range (for retaliation)
 * @param {boolean} [defender.hasFortify] - Whether unit has Fortify skill
 * @param {string} [defender.defenseBonusType='none'] - 'none', 'terrain', or 'wall'
 * @param {boolean} [defender.isPoisoned=false]
 * @param {boolean} [defender.isFrozen=false]
 * 
 * @param {Object} [options]
 * @param {boolean} [options.isMeleeDistance=true] - Whether attack is executed at adjacent (melee) distance
 * @param {number} [options.distance=1] - Distance of the attack
 * @param {boolean} [options.allowWallWithoutFortify=false] - For custom what-if testing
 */
export function calculateCombat(attacker, defender, options = {}) {
  const isMeleeDistance = options.distance !== undefined ? options.distance === 1 : (options.isMeleeDistance ?? true);
  
  // 1. Determine Defender's effective Defense Bonus multiplier
  let bonusType = (defender.defenseBonusType || 'none').toLowerCase();
  if (!DEFENSE_BONUSES[bonusType]) {
    bonusType = 'none';
  }

  const unitHasFortify = hasFortifySkill(defender);
  let wallDisallowed = false;

  // In Polytopia, only units with Fortify can benefit from City Walls or City defense bonuses
  if (bonusType === 'wall' && !unitHasFortify && !options.allowWallWithoutFortify) {
    bonusType = 'none';
    wallDisallowed = true;
  }

  const bonusConfig = DEFENSE_BONUSES[bonusType] || DEFENSE_BONUSES.none;
  const effectiveDefenseBonus = defender.isPoisoned ? bonusConfig.poisonedMultiplier : bonusConfig.multiplier;

  // 2. Compute Forces
  // AttackForce = Attacker.Attack * (Attacker.HP / Attacker.MaxHP)
  const attackHpRatio = Math.max(0, attacker.currentHp) / Math.max(1, attacker.maxHp);
  const attackForce = attacker.attack * attackHpRatio;

  // DefenseForce = Defender.Defense * (Defender.HP / Defender.MaxHP) * DefenseBonus
  const defenseHpRatio = Math.max(0, defender.currentHp) / Math.max(1, defender.maxHp);
  const defenseForce = defender.defense * defenseHpRatio * effectiveDefenseBonus;

  const totalForce = attackForce + defenseForce;

  // 3. Compute Damage Dealt to Defender
  let damageToDefender = 0;
  if (totalForce > 0) {
    // Damage = round((AttackForce / TotalForce) * Attacker.Attack * 4.5)
    damageToDefender = Math.round((attackForce / totalForce) * attacker.attack * 4.5);
  }
  damageToDefender = Math.max(0, damageToDefender);

  const defenderRemainingHp = Math.max(0, defender.currentHp - damageToDefender);
  const defenderKilled = defenderRemainingHp === 0;

  // 4. Compute Counter-Attack (Retaliation) Damage to Attacker
  // Retaliation conditions in Polytopia:
  // - Defender must survive (defenderRemainingHp > 0)
  // - Defender must NOT be frozen
  // - Attacker must be within Defender's attack range (or at melee distance)
  // - Defender must have defense capability (> 0 defense)
  let damageToAttacker = 0;
  let canRetaliate = false;
  let retaliationReason = '';

  if (defenderKilled) {
    canRetaliate = false;
    retaliationReason = 'Defender eliminated (no retaliation)';
  } else if (defender.isFrozen) {
    canRetaliate = false;
    retaliationReason = 'Defender is frozen';
  } else if (!isMeleeDistance && (defender.range || 1) < (options.distance || 2)) {
    canRetaliate = false;
    retaliationReason = 'Attacker out of defender retaliation range';
  } else if (defender.defense <= 0) {
    canRetaliate = false;
    retaliationReason = 'Defender has 0 defense';
  } else {
    canRetaliate = true;
    if (totalForce > 0) {
      // Retaliation calculates against the defender's state before the blow:
      damageToAttacker = Math.round((defenseForce / totalForce) * defender.defense * 4.5);
    }
  }

  damageToAttacker = Math.max(0, damageToAttacker);
  const attackerRemainingHp = Math.max(0, attacker.currentHp - damageToAttacker);
  const attackerKilled = attackerRemainingHp === 0;

  return {
    attackerDamageDealt: damageToDefender,
    defenderRemainingHp,
    defenderKilled,

    defenderRetaliationDealt: damageToAttacker,
    attackerRemainingHp,
    attackerKilled,
    canRetaliate,
    retaliationReason,
    wallDisallowed,

    // Mathematical details for breakdown
    stats: {
      attackForce: Number(attackForce.toFixed(3)),
      defenseForce: Number(defenseForce.toFixed(3)),
      totalForce: Number(totalForce.toFixed(3)),
      bonusType,
      effectiveDefenseBonus,
      accelerator: 4.5,
      attackProportion: totalForce > 0 ? Number((attackForce / totalForce).toFixed(3)) : 0,
      defenseProportion: totalForce > 0 ? Number((defenseForce / totalForce).toFixed(3)) : 0,
    }
  };
}

/**
 * Simulates a multi-attacker sequence against a single target.
 * Useful for siege planning (e.g. attacking a walled Defender or Giant with multiple units).
 */
export function simulateSequence(attackers, targetInitialState, options = {}) {
  let currentTarget = { ...targetInitialState };
  const history = [];

  for (let i = 0; i < attackers.length; i++) {
    const attacker = { ...attackers[i] };
    
    // If target is already dead, subsequent units don't need to attack
    if (currentTarget.currentHp <= 0) {
      history.push({
        step: i + 1,
        attacker,
        defenderBefore: { ...currentTarget },
        defenderAfter: { ...currentTarget },
        combatResult: null,
        skipped: true,
        summary: `${attacker.name} held back (target already eliminated)`
      });
      continue;
    }

    const combatResult = calculateCombat(attacker, currentTarget, {
      distance: attacker.attackDistance || (attacker.range > 1 ? attacker.range : 1),
      isMeleeDistance: (attacker.attackDistance || 1) === 1,
      allowWallWithoutFortify: options.allowWallWithoutFortify
    });

    const defenderBefore = { ...currentTarget };
    currentTarget.currentHp = combatResult.defenderRemainingHp;

    history.push({
      step: i + 1,
      attacker,
      defenderBefore,
      defenderAfter: { ...currentTarget },
      combatResult,
      skipped: false,
      summary: `${attacker.name} dealt ${combatResult.attackerDamageDealt} dmg (took ${combatResult.defenderRetaliationDealt} retaliation)`
    });
  }

  return {
    finalTargetHp: currentTarget.currentHp,
    targetEliminated: currentTarget.currentHp <= 0,
    steps: history,
    totalAttackerLosses: history.filter(h => h.combatResult && h.combatResult.attackerKilled).length,
    totalAttackerDamageTaken: history.reduce((sum, h) => sum + (h.combatResult?.defenderRetaliationDealt || 0), 0),
  };
}
