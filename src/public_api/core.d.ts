import type {Observable} from 'rxjs';
import type {ActionNodeDefinition} from './action';
import type {NodeOption} from './option';
import type {TriggerDefinitionContext, TriggerNodeDefinition} from './trigger';

export type Obj<T> = object & Record<string, T>;

/** The public API */
export default interface Api {
  /** Define a new action */
  defineAction<T extends object = {}>(definition: ActionNodeDefinition<T>): void;

  /** Define a new trigger */
  defineTrigger<T extends object = {}>(definition: TriggerNodeDefinition): TriggerDefinitionContext<T>;
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

/** Common node definition */
export interface NodeDefinition<T extends object = {}> extends Referenceable {
  category?: string;

  /** The icon */
  media: string;

  options?: NodeOption[];

  /** Options to set by default when building workflows */
  initOptions?(): Partial<T>;
}

/** Something that can be referenced */
export interface Referenceable {
  label: string;

  localID: string;

  namespace: string;
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

