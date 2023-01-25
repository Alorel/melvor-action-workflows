import {VNode} from 'preact';
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

  /** Option names to reset when this option changes */
  resets?: string[];

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

  /**
   * Receive the node's options as props and render them in a more fitting way.
   *
   * - The default renderer will be used if this returns `null`/`undefined`
   * - A Preact-renderable response - {@link VNode}, `string`, `number` etc will override the default renderer
   *
   * @see https://github.com/Alorel/melvor-action-workflows/issues/111
   */
  compactRender?: (props: T) => VNode | null | undefined;

  /** Flag this node for deprecation. Optionally include a deprecation message */
  deprecated?: true | string;

  /** Node description */
  description?: string;

  /** The icon */
  media: string;

  options?: NodeOption[];

  /** Options to set by default when building workflows */
  initOptions?(): Partial<T>;
}

/** Something that can be referenced */
export interface Referenceable {
  id: string;

  label: string;
}

export interface ActionRef {
  readonly id: string;

  /** Get a shallow clone of the action's option values */
  get opts(): Obj<any>;
}

export interface StepRef {
  /** The step trigger's ID */
  readonly triggerId: string;

  /** Get an action by its `id` */
  findActionByActionId(id: string): ActionRef | undefined;

  /** Listen for the trigger to trigger */
  listen(): Observable<void>;
}

export interface WorkflowRef {
  readonly name: string;

  /** Number of steps in the workflow */
  readonly numSteps: number;

  getEmbeddedWorkflow(name: string): WorkflowRef | undefined;

  stepAt(idx: number): StepRef | undefined;
}

/**
 * Context object for the active workflow execution.
 * Requires {@link ActionNodeDefinition#execContext} to be set to `true`.
 */
export interface WorkflowExecutionCtx {
  /** The currently running step index. */
  readonly activeStepIdx: number;

  /**
   * The currently running step index.
   * This will emit the first result on the same tick and will be the same as {@link #stepIdx} if subscribed to
   * immediately.
   */
  readonly activeStepIdx$: Observable<number>;

  /** This step's index in the steps array */
  readonly stepIdx: number;

  /** The associated workflow */
  readonly workflow: WorkflowRef;

  /** Set the currently executed step index. */
  setActiveStepIdx(idx: number): void;
}

