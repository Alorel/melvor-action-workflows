import {Item} from 'melvor';
import {Observable, ObservableInput} from 'rxjs';
import {DynamicOption} from './lib/util/dynamic-option.mjs';

export type Obj<T> = object & Record<string, T>;

/** The public API */
export default interface Api {
  /** Define a new action */
  defineAction<T extends object = {}>(definition: ActionNodeDefinition<T>): void;

  /** Define a new trigger */
  defineTrigger<T extends object = {}>(definition: TriggerNodeDefinition): TriggerDefinitionContext<T>;
}

/** Context of a defined trigger */
export class TriggerDefinitionContext<T extends object = {}> {
  /** The trigger definition */
  readonly def: TriggerNodeDefinition;

  /** The trigger ID */
  readonly id: string;

  private constructor(nope: never);

  /** Notify listeners mething the given filter function */
  public notifyListeners(filter?: (listenerData: T) => any): void;
}

/** An `<input type="text"/>` or `<select>` */
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

export type NodeOption = AltRecipeCostNodeOption
  | NumberNodeOption
  | StringNodeOption
  | MediaItemNodeOption
  | EquipmentSetOption
  | BooleanNodeOption;

/** Something selectable by {@link MediaItemNodeOption} */
export interface MediaSelectable {
  id: string;

  media: string;

  name: string;
}

/** Definition of a trigger */
export interface TriggerNodeDefinition<T extends object = {}> extends NodeDefinition<T> {
  /**
   * Check if the given data passes the trigger. Called when a trigger node activates.
   * @param data Node data
   */
  check(data: T): boolean;

  /** Called when the mod gets enabled */
  init(): void;
}

/** Definition of an action */
export interface ActionNodeDefinition<T extends object> extends NodeDefinition<T> {  /** `true` will supply an additional {@link WorkflowExecutionCtx} argument to the {@link execute} method */
  /** `true` will supply an additional {@link WorkflowExecutionCtx} argument to the {@link execute} method */
  execContext?: boolean;

  /** Execute the action */
  execute(data: T, executionContext?: WorkflowExecutionCtx): void | ObservableInput<void>;
}

/** Common node definition */
export interface NodeDefinition<T extends object = {}> extends Referenceable {
  category?: string;

  /** The icon */
  media: string;

  options?: NodeOption[];

  /** Options to set by default when building workflows */
  initOptions?(): Partial<T>;
}

/**
 * Context object for the active workflow execution.
 * Requires {@link ActionNodeDefinition#execContext} to be set to `true`.
 */
export interface WorkflowExecutionCtx {
  /**
   * The currently running step index.
   * This will emit the first result on the same tick and will be the same as {@link #stepIdx} if subscribed to
   * immediately.
   */
  activeStepIdx$: Observable<number>;

  /** The number of steps in the workflow */
  numSteps: number;

  /** This step's index in the steps array */
  stepIdx: number;

  /** Set the currently executed step index. */
  setActiveStepIdx(idx: number): void;
}

/** Something that can be referenced */
export interface Referenceable {
  label: string;

  localID: string;

  namespace: string;
}

/** Common node option */
export interface NodeOptionBase extends Omit<Referenceable, 'namespace'> {
  /** Info tooltip */
  description?: string;

  /**
   * Usually means `!= null`, but if the option returns, say, an array, it can mean that the array mustn't be empty
   */
  required?: boolean;

  type: any;

  /**
   * Only show the option if this function returns false.
   * Always show it if the function isn't defined
   * @param optionValues Other options' values
   */
  showIf?(optionValues: Obj<any>): boolean;
}
