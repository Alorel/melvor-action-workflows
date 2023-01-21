// noinspection JSUnusedGlobalSymbols

import type {PotionReuseTarget} from './misc';
import type {EquipSlotType} from './toon';

export class Item extends NamespacedObject {
  _media: string;

  category: string;

  golbinRaidExclusive: boolean;

  ignoreCompletion: boolean;

  obtainFromItemLog: boolean;

  sellsFor: number;

  type: string;

  get description(): string;

  get hasDescription(): boolean;

  get media(): string;
}

export class WeaponItem extends Item {
}

export class EquipmentItem extends Item {
  ammoType?: AmmoTypeID;

  tier?: string;

  validSlots: EquipSlotType[];
}

export class FoodItem extends Item {

}

export class PotionItem extends Item {
  action: PotionReuseTarget;

  getActivePotionForAction(): PotionItem | undefined;

  getPotionCharges(potion: PotionItem): number;

  isPotionActive(potion: PotionItem): boolean;

  isPotionActiveForAction(action: PotionReuseTarget): boolean;

  toggleAutoReusePotion(action: PotionReuseTarget): void;
}

export enum AmmoTypeID {
  Arrows = 0,
  Bolts = 1,
  Javelins = 2,
  ThrowingKnives = 3,
  None = 4,
}
