import {ActivePrayer, CombatArea, CombatSpell, Dungeon, Pet, PetManager, SlayerArea, SpecialAttack} from 'melvor';
import type {Monster} from './combat';
import {Attack, AttackStyle} from './combat';
import type {EquipmentItem, Item} from './item';
import type {
  CombatManager,
  Gamemode,
  GP,
  ItemRegistry,
  Page,
  PotionManager,
  Requirement,
  Shop,
  SlayerCoins
} from './misc';
import type {
  Agility,
  AltMagic,
  Astrology,
  Cooking,
  Crafting,
  Firemaking,
  Fishing,
  Fletching,
  Herblore,
  Mining,
  Runecrafting,
  Skill,
  Smithing,
  Summoning,
  Thieving,
  Woodcutting,
} from './skilling';

export class NamespacedObject {
  constructor(namespace: Pick<Namespace, 'name'>, localID: string);

  get id(): string;

  get isModded(): boolean;

  get localID(): string;

  get name(): string;

  get namespace(): string;
}

export interface Namespace {
  displayName: string;

  isModded: boolean;

  name: string;
}

export class Bank {
  baseSlots: number;

  items: Map<Item, BankItem>;

  get itemCountSelected(): number;

  get maximumSlots(): number;

  get occupiedSlots(): number;

  addItem<T extends Item>(item: T, quantity: number): boolean;

  addItemByID(id: string, qty: number): void;

  getQty<T extends Item>(item: T | undefined): number;

  processItemSale(item: Item, qty: number): void;

  removeItemQuantity<T extends Item>(item: T, quantity: number, removeItemCharges?: number): void;
}

export class BankItem<T extends Item = Item> {
  bank: Bank;

  item: T;

  quantity: number;

  tab: number;

  tabPosition: number;

  get isGlowing(): boolean;

  get itemSellValue(): number;

  get locked(): boolean;

  get stackValue(): number;
}

export interface RuneRequirement {
  item: Item;

  quantity: number;
}

export class BaseSpell extends NamespacedObject {
  level: number;

  requirements: any[];

  runesRequired: RuneRequirement[];

  get media(): string;
}

export class NamespaceRegistry<T> {
  namespaceMaps: Map<string, Map<string, T>>;

  registeredObjects: Map<string, T>;

  /** game.registeredNamespaces */
  constructor(rootNamespaceMap: NamespaceMap);

  get firstObject(): T | undefined;

  get size(): number;

  getObject(namespace: string, id: string): T | undefined;

  getObjectByID(id: string): T | undefined;

  registerObject(obj: T): void;
}

export class NamespaceMap {
  public registeredNamespaces: Map<string, KeyValue<Namespace>>;
}

export interface KeyValue<V> {
  key: string;

  value: V;
}

export interface Namespace {
  displayName: string;

  isModded: boolean;

  name: string;
}

export class Game {

  activeAction?: Skill;

  agility: Agility;

  altMagic: AltMagic;

  ancientSpells: NamespaceRegistry<CombatSpell>;

  archaicSpells: NamespaceRegistry<CombatSpell>;

  astrology: Astrology;

  attack: Attack;

  attackStyles: NamespaceRegistry<AttackStyle>;

  auroraSpells: NamespaceRegistry<CombatSpell>;

  bank: Bank;

  combat: CombatManager;

  combatAreas: NamespaceRegistry<CombatArea>;

  cooking: Cooking;

  crafting: Crafting;

  readonly currentGamemode: Gamemode;

  curseSpells: NamespaceRegistry<CombatSpell>;

  dungeons: NamespaceRegistry<Dungeon>;

  emptyEquipmentItem: EquipmentItem;

  firemaking: Firemaking;

  fishing: Fishing;

  fletching: Fletching;

  gp: GP;

  herblore: Herblore;

  items: ItemRegistry;

  mining: Mining;

  monsters: NamespaceRegistry<Monster>;

  pages: NamespaceRegistry<Page>;

  petManager: PetManager;

  pets: NamespaceRegistry<Pet>;

  potions: PotionManager;

  prayer: Skill;

  prayers: NamespaceRegistry<ActivePrayer>;

  registeredNamespaces: NamespaceMap;

  runecrafting: Runecrafting;

  shop: Shop;

  skills: NamespaceRegistry<Skill>;

  slayer: Skill;

  slayerAreas: NamespaceRegistry<SlayerArea>;

  slayerCoins: SlayerCoins;

  smithing: Smithing;

  specialAttacks: NamespaceRegistry<SpecialAttack>;

  standardSpells: NamespaceRegistry<CombatSpell>;

  summoning: Summoning;

  thieving: Thieving;

  woodcutting: Woodcutting;

  checkRequirement(req: Requirement): boolean;

  public stopActiveAction(): void;
}
