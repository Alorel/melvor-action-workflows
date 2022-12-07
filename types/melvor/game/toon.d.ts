import {AttackStyle, AttackTypeID} from 'melvor';
import type {EquipmentItem, Item} from './item';

export const enum EquipSlotType {
  Amulet = 'Amulet',
  Boots = 'Boots',
  Cape = 'Cape',
  Consumable = 'Consumable',
  Gloves = 'Gloves',
  Helmet = 'Helmet',
  Passive = 'Passive',
  Platebody = 'Platebody',
  Platelegs = 'Platelegs',
  Quiver = 'Quiver',
  Ring = 'Ring',
  Shield = 'Shield',
  Summon1 = 'Summon1',
  Summon2 = 'Summon2',
  Weapon = 'Weapon',
}

export class Equipment {
  slotArray: EquipSlot[];

  slotMap: Map<EquipmentItem, string>;

  slots: Record<EquipSlotType, EquipSlot>;
}

export class EquipSlot {
  emptyItem: EquipmentItem;

  item: EquipmentItem;

  occupiedBy: string;

  occupies: any[];

  type: EquipSlotType;
}

export class EquipmentSet {
  equipment: Equipment;
}

export type EquipItemArgSlot = EquipSlotType | 'Default';

export class Player extends Character {
  attackType: AttackTypeID;

  equipToSet: number;

  equipmentSets: EquipmentSet[];

  get equipment(): Equipment;

  get numEquipSets(): number;

  get selectedEquipmentSet(): number;

  changeEquipToSet(setIdx: number): void;

  changeEquipmentSet(setId: number): void;

  equipFood(food: Item, quantity: number): void;

  /**
   * @param item
   * @param set
   * @param [slot='Default']
   * @param [quantity=1]
   */
  equipItem(item: EquipmentItem, set: number, slot?: EquipItemArgSlot, quantity?: number): void;

  isEquipmentSlotUnlocked(slot: EquipSlotType | undefined): boolean;

  setAttackStyle(attackType: AttackTypeID, attackStyle: AttackStyle): void;
}

export class Character extends NamespacedObject {
}
