import {Item} from 'melvor';
import {ComponentType} from 'preact';
import {ObservableInput} from 'rxjs';

export type Obj<T> = object & Record<string, T>;

export interface Api {
  defineAction<T extends object = {}>(definition: ActionNodeDefinition<T>): void;

  defineOption<Val, Interface extends NodeOptionBase>(opt: OptionDefinition<Val, Interface>): void;

  defineTrigger<T extends object = {}>(definition: TriggerNodeDefinition): TriggerDefinitionContext<T>;
}

export interface NodeValidationStore {
  readonly errors: string[];

  touched: boolean;
}

export interface OptionRenderEditCtx<Val, Interface> {
  value?: Val;

  option: Interface;

  otherValues: Obj<any>;

  onChange(value?: Val): void;
}

export interface OptionRenderViewCtx<Val, Interface> {
  option: Interface;

  otherValues: Obj<any>;

  value?: Val;
}

export interface OptionDefinition<Val, Interface extends NodeOptionBase> {
  /** @default true */
  hasLabel?: boolean;

  token: Interface['type'];

  is(v: NodeOptionBase & Obj<any>): v is Interface;

  renderEdit: ComponentType<OptionRenderEditCtx<Val, Interface>>;

  renderView: ComponentType<OptionRenderViewCtx<Val, Interface>>;

  validate?(value: Val | undefined, def: Interface, fullOptsObject: Obj<any>): string[];
}

export class TriggerDefinitionContext<T extends object = {}> {
  readonly def: TriggerNodeDefinition;

  readonly id: string;

  private constructor(nope: never);

  public notifyListeners(filter?: (listenerData: T) => any): void;
}

export interface StringNodeOption extends NodeOptionBase {
  /**
   * Render a `<select>` of these options instead of an `<input>`.
   * key = model value, value = display label
   */
  enum?: Obj<string>;

  type: StringConstructor;
}

export interface BooleanNodeOption extends Omit<NodeOptionBase, 'required'> {
  type: BooleanConstructor;
}

export interface EquipmentSetOption extends NodeOptionBase {
  type: 'EquipmentSet';
}

export interface NumberNodeOption extends NodeOptionBase {
  max?: number;

  min?: number;

  step?: number;

  type: NumberConstructor;
}

export interface AltRecipeCostNodeOption extends NodeOptionBase {
  /** Name of the option holding the main recipe */
  recipeOption: string;

  type: 'AltRecipeCost';

  getAltCostItems(recipe: any): Item[] | undefined;
}

export interface MediaItemNodeOptionMultiConfig {
  maxLength?: number;
}

export interface MediaItemNodeOption extends NodeOptionBase {
  multi?: boolean | MediaItemNodeOptionMultiConfig;

  /**
   * Key of the thing being selected inside the `game` global variable, e.g. if you want to select an item, the item
   * registry is found under `game.items`, so you should put in `items` here. If the path is deep, separate it by
   * dots, e.g. to reference "game.fishing.actions" put in "fishing.actions".
   *
   * The items in this registry must be compatible with the {@link MediaSelectable} interface.
   */
  registry: string | string[] | ((optionValues: Obj<any>) => string | string[]);

  type: 'MediaItem';

  mediaFilter?(item: any, optionValues: Obj<any>): boolean;
}

export type NodeOption = AltRecipeCostNodeOption
  | NumberNodeOption
  | StringNodeOption
  | MediaItemNodeOption
  | EquipmentSetOption
  | BooleanNodeOption;

export interface MediaSelectable {
  id: string;

  media: string;

  name: string;
}

export interface TriggerNodeDefinition<T extends object = {}> extends NodeDefinition<T> {
  /**
   * Check if the given data passes the trigger. Called when a trigger node activates.
   * @param data Node data
   */
  check(data: T): boolean;

  /** Called when the mod gets enabled */
  init(): void;
}

export interface ActionNodeDefinition<T extends object> extends NodeDefinition<T> {
  execute(data: T): void | ObservableInput<void>;
}

export interface NodeDefinition<T extends object = {}> extends Referenceable {
  category?: string;

  media: string;

  options?: NodeOption[];

  /** Options to set by default when building workflows */
  initOptions?(): Partial<T>;
}

export interface Referenceable {
  label: string;

  localID: string;

  namespace: string;
}

export interface NodeOptionBase extends Omit<Referenceable, 'namespace'> {
  /** Info tooltip */
  description?: string;

  required?: boolean;

  type: any;

  showIf?(optionValues: Obj<any>): boolean;

  /** Key used to re-render the component */
  uiKey?(optionValues: Obj<any>): string | number;
}
