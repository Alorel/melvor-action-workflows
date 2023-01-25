// noinspection JSUnusedGlobalSymbols

import {CombatArea, Dungeon, Enemy, Monster} from 'melvor/game/combat';
import type {NamespaceRegistry} from './core';
import type {Item, PotionItem} from './item';
import type {Skill} from './skilling';
import type {Player} from './toon';

export class PetManager {
  unlocked: Set<Pet>;

  unlockPet(pet: Pet): void;

  unlockPetByID(id: string): void;
}

export class Pet extends NamespacedObject {
  get media(): string;
}

export class CombatManager {

  enemy: Enemy;

  isActive: boolean;

  player: Player;

  selectedArea?: CombatArea;

  get media(): string;

  onEnemyDeath(): void;

  selectDungeon(dungeon: Dungeon): void;

  selectMonster(monster: Monster, area: CombatArea): void;

  spawnEnemy(): void;
}

export interface PotionUse {
  charges: number;

  item: PotionItem;
}

export type PotionReuseTarget = Skill | CombatManager;

export class PotionManager {
  public activePotions: Map<PotionReuseTarget, PotionUse>;

  public autoReuseActions: Set<PotionReuseTarget>;

  public autoReusePotionsForAction(action: PotionReuseTarget): boolean;

  public getActivePotionForAction(action: PotionReuseTarget): PotionItem | undefined;

  public getPotionCharges(potion: PotionItem): number;

  public isPotionActive(potion: PotionItem): boolean;

  public isPotionActiveForAction(action: PotionReuseTarget): boolean;

  public toggleAutoReusePotion(action: PotionReuseTarget): void;

  public usePotion(potion: PotionItem, loadPotions?: boolean): void;
}

export interface ItemCost {
  item: Item;

  quantity: number;
}

export interface Requirement {
  type: string;

  [k: string]: any;
}

export class Page extends NamespacedObject {
  canBeDefault: boolean;

  containerID: string;

  hasGameGuide: boolean;

  headerBgClass: string;

  get media(): string;
}

export class ShopPurchase extends NamespacedObject {
  public allowQuantityPurchase: boolean;

  purchaseRequirements: Requirement[];

  unlockRequirements: Requirement[];

  get media(): string;

  getBuyLimit(mode: Gamemode): number;
}

export class Shop extends NamespacedObject {
  buyQuantity: number;

  purchases: NamespaceRegistry<ShopPurchase>;

  upgradesPurchased: Map<ShopPurchase, number>;

  buyItemOnClick(purchase: ShopPurchase, confirmed?: boolean): void;

  getPurchaseCount(purchase: ShopPurchase): number;
}

export class Currency {
  get amount(): number;

  add(amount: number): void;

  onAmountChange(): void;

  remove(amount: number): void;

  set(amount: number): void;
}

export class GP extends Currency {
}

export class SlayerCoins extends Currency {
}

export class Gamemode extends NamespacedObject {
}

export class ItemRegistry extends NamespaceRegistry<Item> {
}
