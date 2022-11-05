import type {Observable, Subscription} from 'rxjs';
import {distinctUntilChanged, EMPTY, of, startWith, switchMap} from 'rxjs';
import {Workflow} from '../../../lib/data/workflow.mjs';
import type {WorkflowCompleteEvent, WorkflowEvent} from '../../../lib/execution/workflow-event.mjs';
import {WorkflowEventType} from '../../../lib/execution/workflow-event.mjs';
import type {WorkflowExecution} from '../../../lib/execution/workflow-execution.mjs';
import WorkflowRegistry from '../../../lib/registries/workflow-registry.mjs';
import {errorLog} from '../../../lib/util/log.mjs';
import {makeComponent} from '../../common.mjs';
import WorkflowEditor from '../../components/workflow-editor/workflow-editor.mjs';
import DashboardStep from './dashboard-step/dashboard-step.mjs';
import NoDashboardsDefined from './no-dashboards-defined/no-dashboards-defined.mjs';
import tplId from './workflows-dashboard.pug';

export interface WorkflowsDashboardStore {
  readonly exec?: WorkflowExecution;

  sub?: Subscription;

  workflow?: Workflow;
}

export default function WorkflowsDashboard() { // eslint-disable-line max-lines-per-function
  const reg = WorkflowRegistry.inst;

  return makeComponent(`#${tplId}`, {
    activeWorkflow: undefined as Workflow | undefined,
    get activeWorkflowId(): number | undefined {
      return this.activeWorkflow?.listId;
    },
    set activeWorkflowId(newId: number | string | undefined) {
      const listId = parseInt(newId as string);
      if (listId === this.activeWorkflowId) {
        return;
      }

      this.resetActive();

      if (newId != null && newId !== '') {
        if (!isNaN(listId)) {
          this.activeWorkflow = this.workflows.find(wf => wf.listId === listId);
          if (this.activeWorkflow) {
            return;
          }
        }
        errorLog(`Selected "${newId}" as the active workflow, but it's not registered`);
      }

      this.activeWorkflow = undefined;
    },
    borderClass: undefined as undefined | string,
    DashboardStep,
    editedWorkflow: undefined as undefined | Workflow,
    exec() {
      this.resetActive();

      // get the unproxied version
      reg.setPrimaryExecution(reg.getWorkflow(this.activeWorkflowId!));
    },
    NoDashboardsDefined,
    onMount() {
      // Heck, otherwise we can't get an unproxied version of a workflow
      reg.onAdd$.subscribe(() => {
        this.workflows = reg.workflows;
      });

      reg.primaryExecution$
        .pipe(
          distinctUntilChanged((a, b) => a?.id === b?.id),
          switchMap(exec => {
            if (!exec) {
              this.running = false;
              return of('summoning');
            }

            this.running = true;

            return exec.pipe(
              switchMap(evtTypeMapper),
              startWith('summoning')
            );
          })
        )
        .subscribe(border => {
          this.borderClass = `border-${border}`;
        });
    },
    renderEditor() {
      return WorkflowEditor({
        cancellable: true,
        onCancel: () => {
          this.editedWorkflow = undefined;
        },
        onSave: () => {
          const clonedWorkflow = Workflow.fromJSON(JSON.parse(JSON.stringify(this.editedWorkflow)))!;
          const currId = this.activeWorkflowId;
          const idx = reg.workflows.findIndex(wf => wf.listId === currId);

          reg.patch(clonedWorkflow, idx);

          this.activeWorkflow = clonedWorkflow;
          this.workflows = reg.workflows;
          this.editedWorkflow = undefined;
        },
        workflow: this.editedWorkflow!,
      });
    },
    resetActive(): void {
      reg.setPrimaryExecution();
    },
    rmWorkflow(): void {
      WorkflowRegistry.inst.removeByListId(this.activeWorkflowId!);
      this.workflows = WorkflowRegistry.inst.workflows;
      this.activeWorkflowId = undefined;
    },
    running: false,
    startEditing(): void {
      this.editedWorkflow = Workflow.fromJSON(JSON.parse(JSON.stringify(this.activeWorkflow)))!;
      this.resetActive();
    },
    workflows: WorkflowRegistry.inst.workflows,
  });
}

function evtTypeMapper(evt: WorkflowEvent): Observable<string> {
  switch (evt.type) {
    case WorkflowEventType.WORKFLOW_START:
      return of('agility');
    case WorkflowEventType.WORKFLOW_COMPLETE:
      return of((evt as WorkflowCompleteEvent).ok ? 'woodcutting' : 'fletching');
    default:
      return EMPTY;
  }
}
