import {ObservableInput} from 'rxjs';

export type Obj<T> = object & Record<string, T>;

export interface Api {
  defineAction<T extends object = {}>(definition: ActionNodeDefinition<T>): void;

  defineTrigger<T extends object = {}>(definition: TriggerNodeDefinition): TriggerDefinitionContext<T>;
}

export class TriggerDefinitionContext<T extends object = {}> {
  readonly def: TriggerNodeDefinition;

  readonly id: string;

  private constructor();

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

export interface NumberNodeOption extends NodeOptionBase {
  max?: number;

  min?: number;

  step?: number;

  type: NumberConstructor;
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
  registry: string;

  type: 'MediaItem';
}

export type NodeOption = NumberNodeOption | StringNodeOption | MediaItemNodeOption;

export interface MediaSelectable {
  id: string;

  media: string;

  name: string;
}

export interface TriggerNodeDefinition extends NodeDefinition {
  /** Called when the mod gets enabled */
  enabled?(): void;
}

export interface ActionNodeDefinition<T> extends NodeDefinition {
  execute(data: T): void | ObservableInput<void>;
}

export interface NodeDefinition extends Referenceable {
  category?: string;

  options?: NodeOption[];

  /** Options to set by default when building workflows */
  initOptions?(): Obj<any>;
}

export interface Referenceable {
  label: string;

  localID: string;

  namespace: string;
}

interface NodeOptionBase extends Omit<Referenceable, 'namespace'> {
  required?: boolean;
}

type DeepReadonlyObj<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };
export type DeepReadonlyArray<T> = readonly DeepReadonly<T>[];
export type DeepReadonly<T> = T extends Function
  ? T
  : T extends Array<infer E>
    ? DeepReadonlyArray<E>
    : T extends Set<infer E>
      ? ReadonlySet<E>
      : T extends Map<infer K, infer V>
        ? ReadonlyMap<K, V>
        : T extends object
          ? DeepReadonlyObj<T>
          : T;
