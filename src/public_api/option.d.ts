import type {Item} from 'melvor';
import type {DynamicOption} from '../lib/util/dynamic-option.mjs';
import type {NodeOptionBase, Obj} from './core';

export type NodeOption = AltRecipeCostNodeOption
  | NumberNodeOption
  | StringNodeOption
  | MediaItemNodeOption
  | StepRefNodeOption
  | EquipmentSetOption
  | BooleanNodeOption;

/** An `<input type="text"/>` or `<select>` */

export interface StepRefNodeOption extends NodeOptionBase {
  type: 'StepRef';
}
export interface StringNodeOption extends NodeOptionBase {
  /**
   * Render a `<select/>` of these options instead of an `<input type="text"/>`.
   * key = model value, value = display label
   */
  enum?: DynamicOption<Obj<string> | undefined>;

  type: StringConstructor;
}

/** A checkbox */
export interface BooleanNodeOption extends Omit<NodeOptionBase, 'required'> {
  type: BooleanConstructor;
}

/** Equipment set select */
export interface EquipmentSetOption extends NodeOptionBase {
  type: 'EquipmentSet';
}

/** `<input type="number"/>` */
export interface NumberNodeOption extends NodeOptionBase {
  /** "max" attribute */
  max?: DynamicOption<number | undefined>;

  /** "min" attribute */
  min?: DynamicOption<number | undefined>;

  /** "step" attribute */
  step?: number;

  type: NumberConstructor;
}

/** Alternative/secondary recipe cost option */
export interface AltRecipeCostNodeOption extends NodeOptionBase {
  /** Name of the option holding the main recipe */
  recipeOption: string;

  type: 'AltRecipeCost';

  /** Get the items available for selection */
  getAltCostItems(recipe: any): Item[] | undefined;
}

/** Config for {@link MediaItemNodeOption}'s {@link MediaItemNodeOption#multi multi} option */
export interface MediaItemNodeOptionMultiConfig {
  maxLength?: number;
}

/** Select from pretty much any in-game registry */
export interface MediaItemNodeOption extends NodeOptionBase {
  /**
   * Select one (`false`) or multiple (`true`/`object`) values?
   * @default false
   */
  multi?: boolean | MediaItemNodeOptionMultiConfig;

  /**
   * Key of the thing being selected inside the `game` global variable, e.g. if you want to select an item, the item
   * registry is found under `game.items`, so you should put in `items` here. If the path is deep, separate it by
   * dots, e.g. to reference "game.fishing.actions" put in "fishing.actions".
   *
   * The items in this registry must be compatible with the {@link MediaSelectable} interface.
   */
  registry: DynamicOption<string | string[]>;

  type: 'MediaItem';

  /** Filter out irrelevant items in the registry */
  mediaFilter?(item: any, optionValues: Obj<any>): boolean;
}

/** Something selectable by {@link MediaItemNodeOption} */
export interface MediaSelectable {
  id: string;

  media: string;

  name: string;
}

