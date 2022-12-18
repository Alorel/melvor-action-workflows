import {memo} from 'preact/compat';
import {useEffect, useState} from 'preact/hooks';
import type {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, EMPTY, of, startWith, switchMap} from 'rxjs';
import type ActionConfigItem from '../../../lib/data/action-config-item.mjs';
import type {ActionExecutionEvent} from '../../../lib/execution/workflow-event.mjs';
import {WorkflowEventType} from '../../../lib/execution/workflow-event.mjs';
import WorkflowRegistry from '../../../lib/registries/workflow-registry.mjs';
import {DefSection} from './def-section';

interface ActionProps {
  action: ActionConfigItem;
}

export const ActionLi = memo<ActionProps>(function ActionLi({action: a}) {
  const liClass = useActionLiClass(a.listId);

  return (
    <li class={`list-group-item pt-0 pb-0 pl-1 pr-1 ${liClass}`} key={a.listId}>
      <DefSection config={a.opts} node={a.action.def} type={'action'}/>
    </li>
  );
});

function useActionLiClass(actionId: number): string {
  const enum Strings {
    INITIAL_CLASS = 'list-group-item-dark',
  }

  const [value, setValue] = useState<string>(Strings.INITIAL_CLASS);
  useEffect(() => {
    const sub = WorkflowRegistry.inst.primaryExecution$
      .pipe(
        switchMap((exec): Observable<string> => {
          if (!exec) {
            return of(Strings.INITIAL_CLASS);
          }

          return exec.pipe(
            switchMap((evt): Observable<string> => {
              if (evt.type === WorkflowEventType.WORKFLOW_RESET || evt.type === WorkflowEventType.STEP_NOT_LISTENING) {
                return of(Strings.INITIAL_CLASS);
              } else if ((evt as Partial<ActionExecutionEvent>).action?.listId === actionId) {
                return of((evt as ActionExecutionEvent).ok ? 'list-group-item-success' : 'list-group-item-danger');
              }

              return EMPTY;
            }),
            startWith(Strings.INITIAL_CLASS)
          );
        }),
        debounceTime(0),
        distinctUntilChanged()
      )
      .subscribe(setValue);

    return () => {
      sub.unsubscribe();
    };
  }, [actionId]);

  return value;
}
