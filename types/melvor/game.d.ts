// noinspection JSUnusedGlobalSymbols

export class NamespacedObject {
  constructor(namespace: Pick<Namespace, 'name'>, localID: string);

  get id(): string;

  get isModded(): boolean;

  get localID(): string;

  get name(): string;

  get namespace(): string;
}

export class Timer {
  active: boolean;

  type: string;

  get isActive(): boolean;

  get maxTicks(): number;

  get ticksLeft(): number;

  action(): void;

  start(): void;

  stop(): void;
}

export class Bank {
  baseSlots: number;

  items: Map<Item, BankItem>;

  get itemCountSelected(): number;

  get maximumSlots(): number;

  get occupiedSlots(): number;

  addItem<T extends Item>(item: T, quantity: number): boolean;

  addItemById(id: string, qty: number): void;

  getQty<T extends Item>(item: T | undefined): number;

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

export class Skill extends NamespacedObject {
  actionTimer: Timer;

  get game(): Game;

  get hasMastery(): boolean;

  get isUnlocked(): boolean;

  get level(): number;

  get levelCap(): number;

  get xp(): number;

  addXP(xp: number): boolean;

  /**
   * @param oldLevel
   * @param newLevel
   */
  onLevelUp(oldLevel: number, newLevel: number): void;
}

export class GatheringSkill<T> extends Skill {
  actions: NamespaceRegistry<T>;

  isActive: boolean;

  stop(): boolean;
}

export class Fishing extends GatheringSkill<Fish> {
  activeFishingArea?: FishingArea;

  areas: NamespaceRegistry<FishingArea>;

  onAreaFishSelection(area: FishingArea, fish: Fish): void;

  onAreaStartButtonClick(area: FishingArea): void;
}

export class Fish extends SingleProductRecipe {
  baseMaxInterval: number;

  baseMinInterval: number;

  strengthXP: number;
}

export class FishingArea extends NamespacedObject {
  fish: Fish[];

  fishChance: number;

  isSecret: boolean;

  junkChance: number;

  specialChange: number;
}

export class Woodcutting extends GatheringSkill<WoodcuttingTree> {
  activeTrees: Set<WoodcuttingTree>;

  selectTree(tree: WoodcuttingTree): void;
}

export class WoodcuttingTree extends SingleProductRecipe {
  canDropRavenNest: boolean;
}

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

export class SingleProductRecipe extends BasicSkillRecipe {
  get media(): string;
}

export class FiremakingLog extends BasicSkillRecipe {
  get media(): string;
}

export class Firemaking extends CraftingSkill<FiremakingLog> {
  burnLog(): void;

  selectLog(log: FiremakingLog): void;
}

export class CookingRecipe extends BasicSkillRecipe {
  category: CookingCategory;
}

export class Cooking extends CraftingSkill<CookingRecipe> {
  onActiveCookButtonClick(category: CookingCategory): void;

  onPassiveCookButtonClick(category: CookingCategory): void;

  onRecipeSelectionClick(recipe: CookingRecipe): void;
}

export class CookingCategory extends SkillCategory {
  upgradeOwned: boolean;

  upgradeRequired: boolean;
}

export class SkillCategory extends NamespacedObject {
}

export class CraftingSkill<R> extends GatheringSkill<R> {
  get media(): string;
}

export class BasicSkillRecipe extends NamespacedObject {
  baseExperience: number;

  baseInterval: number;

  level: number;

  product: Item;

  shopItemPurchased?: ShopPurchase;
}

export class ShopPurchase extends NamespacedObject {
}

export class Shop extends NamespacedObject {
  buyQuantity: number;

  upgradesPurchased: Map<ShopPurchase, number>;
}

export class ItemRegistry extends NamespaceRegistry<Item> {
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

export class Page extends NamespacedObject {
  canBeDefault: boolean;

  containerID: string;

  hasGameGuide: boolean;

  headerBgClass: string;

  get media(): string;
}

export class Game {
  activeAction?: Skill;

  bank: Bank;

  cooking: Cooking;

  firemaking: Firemaking;

  fishing: Fishing;

  items: ItemRegistry;

  pages: NamespaceRegistry<Page>;

  registeredNamespaces: NamespaceMap;

  shop: Shop;

  skills: NamespaceRegistry<Skill>;

  woodcutting: Woodcutting;
}
