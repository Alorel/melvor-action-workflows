import type {ObservableInput} from 'rxjs';
import type {NodeDefinition, WorkflowExecutionCtx} from './core';

/** Definition of an action */
export interface ActionNodeDefinition<T extends object> extends NodeDefinition<T> {  /** `true` will supply an additional {@link WorkflowExecutionCtx} argument to the {@link execute} method */
  /** `true` will supply an additional {@link WorkflowExecutionCtx} argument to the {@link execute} method */
  execContext?: boolean;

  /** Execute the action */
  execute(data: T, executionContext?: WorkflowExecutionCtx): void | ObservableInput<void>;
}
