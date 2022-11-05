import type {Observable, Subscription} from 'rxjs';
import {distinctUntilChanged, EMPTY, of, pairwise, startWith, switchMap} from 'rxjs';
import type {WorkflowStep} from '../../../../lib/data/workflow-step.mjs';
import type {
  ActionExecutionEvent,
  StepCompleteEvent,
  StepListeningEvent,
  WorkflowEvent
} from '../../../../lib/execution/workflow-event.mjs';
import {WorkflowEventType} from '../../../../lib/execution/workflow-event.mjs';
import WorkflowRegistry from '../../../../lib/registries/workflow-registry.mjs';
import {makeComponent} from '../../../common.mjs';
import DashboardNodeDefSection from '../dashboard-node-def-section/dashboard-node-def-section.mjs';
import tplId from './dashboard-step.pug';

interface Props {
  step: WorkflowStep;
}

const enum Strings {
  INITIAL_CLASS = 'list-group-item-dark',
}

function liSubs() {
  const subs = new Map<number, Subscription>();

  return {
    onActionMount(li: HTMLElement, actionId: number) {
      li.classList.add(Strings.INITIAL_CLASS);

      const sub = WorkflowRegistry.inst.primaryExecution$
        .pipe(
          switchMap((exec): Observable<string> => {
            if (!exec) {
              return of(Strings.INITIAL_CLASS);
            }

            return exec.pipe(
              switchMap((evt): Observable<string> => (
                (evt as Partial<ActionExecutionEvent>).action?.listId === actionId
                  ? of((evt as ActionExecutionEvent).ok ? 'list-group-item-success' : 'list-group-item-danger')
                  : EMPTY
              )),
              startWith(Strings.INITIAL_CLASS)
            );
          }),
          distinctUntilChanged(),
          pairwise()
        )
        .subscribe(([old, nu]) => {
          li.classList.remove(old);
          li.classList.add(nu);
        });

      subs.set(actionId, sub);
    },
    onActionUnmount(actionId: number) {
      const sub = subs.get(actionId);
      if (sub) {
        sub.unsubscribe();
        subs.delete(actionId);
      }
    },
  } as const;
}

function mainSub(stepId: number) {
  let sub: Subscription | undefined;

  function mainBorderMapper(evt: WorkflowEvent): Observable<string> {
    if ((evt as Partial<StepListeningEvent>).step?.listId !== stepId) {
      return EMPTY;
    }

    switch (evt.type) {
      case WorkflowEventType.STEP_LISTENING:
        return of('agility');
      case WorkflowEventType.STEP_COMPLETE:
        return of((evt as StepCompleteEvent).ok ? 'woodcutting' : 'fletching');
      default:
        return EMPTY;
    }
  }

  return {
    hostClass: undefined as string | undefined,
    onMount() {
      sub = WorkflowRegistry.inst.primaryExecution$
        .pipe(
          switchMap(x => (
            x?.pipe(switchMap(mainBorderMapper), startWith('summoning')) ?? of('summoning')
          ))
        )
        .subscribe(border => {
          this.hostClass = `border-${border}`;
        });
    },
    onUnmount() {
      sub?.unsubscribe();
    },
  };
}

export default function DashboardStep({step}: Props) {
  return makeComponent(`#${tplId}`, {
    DashboardNodeDefSection,
    step,
    ...liSubs(),
    ...mainSub(step.listId),
  });
}
