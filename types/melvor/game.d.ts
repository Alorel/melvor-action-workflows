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

export interface ItemCost {
  item: Item;

  quantity: number;
}

export interface Requirement {
  type: string;

  [k: string]: any;
}

export interface FletchingAlternativeCosts {
  itemCosts: ItemCost[];

  quantityMultiplier: number;
}

export class FletchingRecipe extends SingleProductArtisanSkillRecipe {
  public alternativeCosts?: FletchingAlternativeCosts[];
}

export class Fletching extends ArtisanSkill<FletchingRecipe> {
}

export class ThievingNPC extends BasicSkillRecipe {
}

export class Crafting extends ArtisanSkill<SingleProductArtisanSkillRecipe> {

}

export class Runecrafting extends ArtisanSkill<SingleProductArtisanSkillRecipe> {

}

export class AstrologyRecipe extends BasicSkillRecipe {
}

export class Astrology extends GatheringSkill<AstrologyRecipe> {
  activeConstellation?: AstrologyRecipe;

  public studyConstellationOnClick(constellation: AstrologyRecipe): void;
}

export class Agility extends GatheringSkill<object> {
}

export class HerbloreRecipe extends CategorizedArtisanRecipe {
}

export class Herblore extends ArtisanSkill<HerbloreRecipe> {
}

export class ThievingArea extends NamespacedObject {
  public npcs: ThievingNPC[];
}

export class Thieving extends GatheringSkill<ThievingNPC> {
  public areas: NamespaceRegistry<ThievingArea>;

  public currentArea?: ThievingArea;

  public currentNPC?: ThievingNPC;

  public startThieving(area: ThievingArea, npc: ThievingNPC): void;
}

export class Skill extends NamespacedObject {
  actionTimer: Timer;

  get game(): Game;

  get hasMastery(): boolean;

  get isUnlocked(): boolean;

  get level(): number;

  get levelCap(): number;

  get media(): string;

  get xp(): number;

  addXP(xp: number): boolean;

  /**
   * @param oldLevel
   * @param newLevel
   */
  onLevelUp(oldLevel: number, newLevel: number): void;
}

export class SkillWithMastery<T> extends Skill {
  actionMastery: Map<T, {level: number; xp: number;}>;

  get masteryLevelCap(): number;

  get masteryPoolProgress(): number;

  addMasteryPoolXP(xp: number): void;

  addMasteryXP(action: T, xp: number): void;

  onMasteryLevelUp(action: T, oldLvl: number, newLvl: number): void;
}

export class GatheringSkill<T> extends SkillWithMastery<T> {
  actions: NamespaceRegistry<T>;

  isActive: boolean;

  start(): void;

  stop(): boolean;
}

export class Fishing extends GatheringSkill<Fish> {
  activeFishingArea?: FishingArea;

  areas: NamespaceRegistry<FishingArea>;

  get activeFish(): Fish | never;

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

export class MiningRock extends SingleProductRecipe {
}

export class ArtisanSkill<T> extends GatheringSkill<T> {
  selectedRecipe?: T;

  get activeRecipe(): T | never;

  createButtonOnClick(): void;

  public selectAltRecipeOnClick(altCostIdx: number): void;

  selectRecipeOnClick(recipe: T): void;
}

export class SingleProductArtisanSkillRecipe extends CategorizedArtisanRecipe {
}

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
}

export class Enemy extends Character {

}

export class Character {
}

export class CombatManager {
  enemy: Enemy;

  player: Player;
}

export class SummoningRecipe extends CategorizedArtisanRecipe {
  gpCost: number;

  itemCosts: Item[];

  nonShardItemCosts: Item[];

  scCost: number;

  tier: number;
}

export class Summoning extends ArtisanSkill<SummoningRecipe> {
}

export class Smithing extends ArtisanSkill<SingleProductArtisanSkillRecipe> {
}

export class CategorizedArtisanRecipe extends ArtisanSkillRecipe {
}

export class ArtisanSkillRecipe extends BasicSkillRecipe {
}

export class Mining extends GatheringSkill<MiningRock> {
  selectedRock?: MiningRock;

  canMineOre(rock: MiningRock): boolean;

  onRockClick(rock: MiningRock): void;
}

export class Woodcutting extends GatheringSkill<WoodcuttingTree> {
  activeTrees: Set<WoodcuttingTree>;

  selectTree(tree: WoodcuttingTree): void;
}

export class WoodcuttingTree extends SingleProductRecipe {
  canDropRavenNest: boolean;
}

export class WeaponItem extends Item {
}

export class EquipmentItem extends Item {
  validSlots: EquipSlotType[];
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
  selectedRecipe?: FiremakingLog;

  burnLog(): void;

  selectLog(log: FiremakingLog): void;
}

export class CookingRecipe extends BasicSkillRecipe {
  category: CookingCategory;
}

export class Cooking extends CraftingSkill<CookingRecipe> {
  activeCookingCategory?: CookingCategory;

  get activeRecipe(): CookingRecipe | never;

  onActiveCookButtonClick(category: CookingCategory): void;

  onPassiveCookButtonClick(category: CookingCategory): void;

  onRecipeSelectionClick(recipe: CookingRecipe): void;

  passiveCookingAction(cat: CookingCategory): void;
}

export class CookingCategory extends SkillCategory {
  upgradeOwned: boolean;

  upgradeRequired: boolean;
}

export class SkillCategory extends NamespacedObject {
}

export class CraftingSkill<R> extends GatheringSkill<R> {

}

export class BasicSkillRecipe extends NamespacedObject {
  baseExperience: number;

  baseInterval: number;

  level: number;

  product: Item;

  shopItemPurchased?: ShopPurchase;
}

export class ShopPurchase extends NamespacedObject {
  public allowQuantityPurchase: boolean;

  purchaseRequirements: Requirement[];

  unlockRequirements: Requirement[];

  getBuyLimit(mode: Gamemode): number;
}

export class Shop extends NamespacedObject {
  buyQuantity: number;

  purchases: NamespaceRegistry<ShopPurchase>;

  upgradesPurchased: Map<ShopPurchase, number>;

  buyItemOnClick(purchase: ShopPurchase, confirmed?: boolean): void;

  getPurchaseCount(purchase: ShopPurchase): number;
}

export class Gamemode extends NamespacedObject {
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

  agility: Agility;

  astrology: Astrology;

  bank: Bank;

  combat: CombatManager;

  cooking: Cooking;

  crafting: Crafting;

  readonly currentGamemode: Gamemode;

  emptyEquipmentItem: EquipmentItem;

  firemaking: Firemaking;

  fishing: Fishing;

  fletching: Fletching;

  herblore: Herblore;

  items: ItemRegistry;

  mining: Mining;

  pages: NamespaceRegistry<Page>;

  registeredNamespaces: NamespaceMap;

  runecrafting: Runecrafting;

  shop: Shop;

  skills: NamespaceRegistry<Skill>;

  smithing: Smithing;

  summoning: Summoning;

  thieving: Thieving;

  woodcutting: Woodcutting;

  checkRequirement(req: Requirement): boolean;
}
