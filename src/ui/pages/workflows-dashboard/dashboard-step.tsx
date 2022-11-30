import type {VNode} from 'preact';
import type {HTMLAttributes} from 'preact/compat';
import {memo, useMemo} from 'preact/compat';
import {useCallback, useEffect, useState} from 'preact/hooks';
import type {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, EMPTY, of, startWith, switchMap} from 'rxjs';
import type {WorkflowStep} from '../../../lib/data/workflow-step.mjs';
import type {StepCompleteEvent, StepListeningEvent, WorkflowEvent} from '../../../lib/execution/workflow-event.mjs';
import {WorkflowEventType} from '../../../lib/execution/workflow-event.mjs';
import WorkflowRegistry from '../../../lib/registries/workflow-registry.mjs';
import {EMPTY_ARR} from '../../../lib/util.mjs';
import {BorderedBlock} from '../../components/block';
import type {BtnProps} from '../../components/btn';
import Btn from '../../components/btn';
import {ChevronLeftSvg, ChevronRightSvg, TargetSvg} from '../../components/svg';
import useTippy from '../../hooks/tippy.mjs';
import {DefSection} from './def-section';
import {ActionLi} from './step-action-li';

interface Props {
  mvLeft: boolean;

  mvRight: boolean;

  setActive: boolean;

  step: WorkflowStep;

  onSetActive(): void;

  onShift(direction: 1 | -1): void;
}

export {Props as DashboardStepProps};

const DashboardStep = memo<Props>(
  ({
    mvLeft,
    mvRight,
    onSetActive,
    onShift,
    setActive,
    step,
  }) => {
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
          {(mvLeft || mvRight || setActive) && <MoveBtns mvLeft={mvLeft}
            mvRight={mvRight}
            setActive={setActive}
            onSetActive={onSetActive}
            onShift={onShift}/>}
        </BorderedBlock>
      </div>
    );
  }
);
DashboardStep.displayName = 'DashboardStep';

export default DashboardStep;

type MoveBtnsProps = Pick<Props, 'mvLeft' | 'mvRight' | 'onShift' | 'setActive' | 'onSetActive'>;

function MoveBtns({mvLeft, mvRight, setActive, onSetActive, onShift}: MoveBtnsProps): VNode {
  const onClick = useCallback((e: Event): void => {
    let tgt = e.target as HTMLElement | null;
    while (tgt && tgt.tagName !== 'BUTTON' && tgt.tagName !== 'DIV') {
      tgt = tgt.parentElement;
    }

    const shift = parseInt(tgt?.dataset.shift as string);
    if (shift === -1 || shift === 1) {
      onShift(shift);
    }
  }, [onShift]);

  const onSetActiveClick = useCallback((e: Event) => {
    e.stopPropagation();
    onSetActive();
  }, [onSetActive]);

  return (
    <div class={'text-center'}>
      <div class={'btn-group btn-group-sm m-auto'} onClick={onClick}>
        {mvLeft && (
          <MoveBtn tooltip={'Shift this step towards the start'} data-shift={-1}>
            <ChevronLeftSvg/>
          </MoveBtn>
        )}
        {setActive && (
          <MoveBtn tooltip={'Set as active step'} data-setactive={1} onClickCapture={onSetActiveClick}>
            <TargetSvg/>
          </MoveBtn>
        )}
        {mvRight && (
          <MoveBtn tooltip={'Shift this step towards the end'} data-shift={1}>
            <ChevronRightSvg/>
          </MoveBtn>
        )}
      </div>
    </div>
  );
}

interface MoveBtnProps extends Omit<BtnProps, 'kind' | 'btnRef'> {
  tooltip: string;
}

const MoveBtn = memo<MoveBtnProps>(({tooltip, ...rest}) => {
  const btnRef = useTippy<HTMLButtonElement>(tooltip);

  return (<Btn kind={'default'} btnRef={btnRef} {...rest}/>);
});
MoveBtn.displayName = 'MoveBtn';

function useBorder(stepId: number): string {
  const enum Strings {
    DEFAULT_CSS = 'summoning',
  }

  const [border, setBorder] = useState<string>(Strings.DEFAULT_CSS);

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
        case WorkflowEventType.STEP_NOT_LISTENING:
        case WorkflowEventType.WORKFLOW_RESET:
          return of(Strings.DEFAULT_CSS);
        default:
          return EMPTY;
      }
    };

    const sub = WorkflowRegistry.inst.primaryExecution$
      .pipe(
        switchMap(x => (
          x?.pipe(
            switchMap(mainBorderMapper),
            startWith<string>(Strings.DEFAULT_CSS)
          ) ?? of<string>(Strings.DEFAULT_CSS)
        )),
        debounceTime(0),
        distinctUntilChanged()
      )
      .subscribe(setBorder);

    return () => {
      sub.unsubscribe();
    };
  }, [stepId]);

  return border;
}
