import {memo} from 'preact/compat';
import {useEffect, useState} from 'preact/hooks';
import type {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, EMPTY, of, startWith, switchMap} from 'rxjs';
import type {WorkflowEvent} from '../../lib/execution/workflow-event.mjs';
import {WorkflowEventType} from '../../lib/execution/workflow-event.mjs';
import WorkflowRegistry from '../../lib/registries/workflow-registry.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import {PauseSvg, PlaySvg} from './svg';

const SidenavIcon = memo(() => {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const evtMapper = ({type}: WorkflowEvent): Observable<boolean> => {
      switch (type) {
        case WorkflowEventType.WORKFLOW_START:
          return of(true);
        case WorkflowEventType.WORKFLOW_COMPLETE:
          return of(false);
        default:
          return EMPTY;
      }
    };

    const sub = WorkflowRegistry.inst.primaryExecution$
      .pipe(
        switchMap((exec): Observable<boolean> => (
          exec ? exec.pipe(switchMap(evtMapper), startWith(true)) : of(false)
        )),
        debounceTime(0),
        distinctUntilChanged()
      )
      .subscribe(setRunning);
    return () => {
      sub.unsubscribe();
    };
  }, EMPTY_ARR);

  const Comp = running ? PlaySvg : PauseSvg;

  return <Comp class={'mr-1'}/>;
});

export default SidenavIcon;
