import {distinctWithInitial} from '@aloreljs/rxutils/operators';
import type {HTMLAttributes} from 'preact/compat';
import {memo, useMemo} from 'preact/compat';
import {useEffect, useState} from 'preact/hooks';
import type {Observable} from 'rxjs';
import {EMPTY, of, skip, startWith, switchMap} from 'rxjs';
import type {WorkflowStep} from '../../../lib/data/workflow-step.mjs';
import type {StepCompleteEvent, StepListeningEvent, WorkflowEvent} from '../../../lib/execution/workflow-event.mjs';
import {WorkflowEventType} from '../../../lib/execution/workflow-event.mjs';
import WorkflowRegistry from '../../../lib/registries/workflow-registry.mjs';
import {EMPTY_ARR} from '../../../lib/util.mjs';
import {BorderedBlock} from '../../components/block';
import {DefSection} from './def-section';
import {ActionLi} from './step-action-li';

interface Props {
  step: WorkflowStep;
}

const DashboardStep = memo<Props>(({step}) => {
  const border = useBorder(step.listId);
  const contentProps = useMemo((): HTMLAttributes<HTMLDivElement> => ({class: 'pt-2 pl-2'}), EMPTY_ARR);

  return (
    <div class={'col-auto'}>
      <BorderedBlock kind={border} size={2} contentProps={contentProps}>
        <DefSection config={step.trigger.opts} node={step.trigger.trigger.def}/>
        <hr class={'mt-1 mb-1'}/>
        <ul class={'list-group'}>
          {step.actions.map(a => <ActionLi action={a} key={a.listId}></ActionLi>)}
        </ul>
      </BorderedBlock>
    </div>
  );
});

export default DashboardStep;

function useBorder(stepId: number): string {
  const [border, setBorder] = useState('summoning');

  useEffect(() => {
    const mainBorderMapper = (evt: WorkflowEvent): Observable<string> => {
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
    };

    const sub = WorkflowRegistry.inst.primaryExecution$
      .pipe(
        switchMap(x => (
          x?.pipe(
            switchMap(mainBorderMapper),
            startWith('summoning')
          ) ?? of('summoning')
        )),
        distinctWithInitial(border),
        skip(1)
      )
      .subscribe(setBorder);

    return () => {
      sub.unsubscribe();
    };
  }, [stepId]);

  return border;
}
