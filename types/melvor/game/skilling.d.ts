import type {BaseSpell, Game, NamespaceRegistry, RuneRequirement} from './core';
import type {Item} from './item';
import type {ItemCost, ShopPurchase} from './misc';

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

export class AltMagicSpell extends BaseSpell {
  runesRequiredAlt: RuneRequirement[];

  specialCost: AltMagicSpecialCost;
}

export interface AltMagicSpecialCost {
  quantity: number;

  type: AltMagicConsumptionID;
}

export class AltMagic extends CraftingSkill<AltMagicSpell> {
  castButtonOnClick(): void;

  selectBarOnClick(smithingRecipe: SingleProductArtisanSkillRecipe): void;

  selectItemOnClick(item: Item): void;

  selectSpellOnClick(spell: AltMagicSpell): void;
}
export enum AltMagicConsumptionID {
  AnyItem = -1,
  AnyNormalFood = -7,
  AnySuperiorGem = -6,
  BarIngredientsWithCoal = -3,
  BarIngredientsWithoutCoal = -4,
  JunkItem = -2,
  None = -5,
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

  get masteryPoolCapPercent(): number;

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

export class SummoningRecipe extends CategorizedArtisanRecipe {
  gpCost: number;

  itemCosts: Item[];

  nonShardItemCosts: Item[];

  scCost: number;

  tier: number;
}

export class Summoning extends ArtisanSkill<SummoningRecipe> {
  discoverMark(recipe: SummoningRecipe): void;
}

export class Smithing extends ArtisanSkill<SingleProductArtisanSkillRecipe> {
  categories: NamespaceRegistry<SkillCategory>;
}

export class CategorizedArtisanRecipe extends ArtisanSkillRecipe {
  category: SkillCategory;
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
