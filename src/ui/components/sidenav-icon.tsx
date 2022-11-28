import {stubFalse} from 'lodash-es';
import {memo} from 'preact/compat';
import {useEffect, useState} from 'preact/hooks';
import type {Observable} from 'rxjs';
import {concat, distinctUntilChanged, last, map, of, switchMap, takeWhile} from 'rxjs';
import {WorkflowEventType} from '../../lib/execution/workflow-event.mjs';
import WorkflowRegistry from '../../lib/registries/workflow-registry.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import {PauseSvg, PlaySvg} from './svg';

const SidenavIcon = memo(() => {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const sub = WorkflowRegistry.inst.primaryExecution$
      .pipe(
        switchMap((exec): Observable<boolean> => {
          if (!exec) {
            return of(false);
          }

          const src$ = exec
            .pipe(
              takeWhile(({type}) => type !== WorkflowEventType.WORKFLOW_COMPLETE),
              last(null, null),
              map(stubFalse)
            );

          return concat(of(true), src$);
        }),
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
