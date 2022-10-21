import type {WorkflowStep} from './data/workflow-step.mjs';
import {listenToTrigger} from './registries/trigger-registry.mjs';
import {debugLog} from './util/log.mjs';

export interface WorkflowExecutionInit {
  loop?: boolean;

  steps: readonly WorkflowStep[];
}

export class WorkflowExecution {
  public activeStepIdx = 0;

  public readonly loop: boolean;

  public readonly steps: readonly WorkflowStep[];

  private activeListener?: () => void;

  public constructor(init: WorkflowExecutionInit) {
    this.steps = init.steps;
    this.loop = init.loop === true;
  }

  public get activeStep(): WorkflowStep | undefined {
    return this.steps[this.activeStepIdx];
  }

  public get running(): boolean {
    return this.activeListener !== undefined;
  }

  public start(): void {
    if (this.running) {
      return;
    }

    const step = this.activeStep;
    if (!step) {
      debugLog(`Workflow execution: no step at idx ${this.activeStepIdx}`);
      return;
    }

    const actions = step.actions;

    const unlisten = this.activeListener = listenToTrigger<any>(
      {
        data: step.triggerOptions,
        localID: step.trigger!.localID,
        namespace: step.trigger!.namespace,
      },
      async () => {
        for (const action of actions) {
          await action.action.def.execute(action.opts);
        }
        unlisten();
        if (this.activeListener !== unlisten) {
          return;
        }
        this.activeListener = undefined;

        // Start next step if there is one
        if (++this.activeStepIdx < this.steps.length) {
          this.start();
        } else if (this.loop) {
          this.activeStepIdx = 0;
          this.start();
        }
      }
    );
  }

  public stop(): void {
    if (this.activeListener) {
      this.activeListener();
      this.activeListener = undefined;
    }
  }
}
