import {BaseSpell, NamespacedObject} from './core';
import {Skill} from './skilling';
import type {Character} from './toon';

export enum AttackTypeID {
  melee,
  ranged,
  magic,
  unset,
  random
}

export class CombatSpell extends BaseSpell {

}

export class AttackStyle extends NamespacedObject {
  attackType: AttackTypeID;

  experienceGain: Array<{
    ratio: number;
    skill: Skill;
  }>;
}

export class Attack extends CombatSkill {
}

export class CombatSkill extends Skill {

}

export class CombatArea extends NamespacedObject {
  monsters: Monster[];
  get media(): string;
}

export class SlayerArea extends CombatArea {

}

export class Dungeon extends CombatArea {

}

export class Enemy extends Character {
  attackType: Exclude<keyof typeof AttackTypeID, 'random' | 'unset'>;

  availableAttacks: Array<{
    attack: SpecialAttack;
    change: number;
  }>;

  curse?: any;

  monster: Monster;

  nextAttack: SpecialAttack;

  queueNextAction(noSpec?: boolean, tickOffset?: boolean): void;
}

export interface Enemy extends MobLikePartial {
  nextAttack: SpecialAttack;

  passives: Map<unknown, unknown>;

  sleep: {turns: number;};

  stun: {turns: number; flavour: string;};
}

export class Monster extends Character {
  attackType: string;

  canSlayer: boolean;

  equipmentStats: Array<{
    key: 'attackSpeed' | 'stabAttackBonus' | 'meleeStrengthBonus' | 'meleeDefenceBonus';
    value: number;
  }>;

  passives: CombatPassive[];

  specialAttacks: SpecialAttack[];

  get media(): string;
}

export interface Monster extends MobLikePartial {
}

export class SpecialAttack extends NamespacedObject {
  get description(): string;
}

export class CombatPassive extends NamespacedObject {

}

interface MobLikePartial {
  levels: Record<'Attack' | 'Defence' | 'Hitpoints' | 'Magic' | 'Ranged' | 'Strength', number>;
}
