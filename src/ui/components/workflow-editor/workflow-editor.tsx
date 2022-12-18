import type {Signal} from '@preact/signals';
import type {VNode} from 'preact';
import {Fragment} from 'preact';
import type {FunctionComponent} from 'preact/compat';
import {memo} from 'preact/compat';
import {useCallback, useErrorBoundary} from 'preact/hooks';
import type {Workflow} from '../../../lib/data/workflow.mjs';
import {EMPTY_ARR} from '../../../lib/util.mjs';
import swapElements from '../../../lib/util/swap-elements.mjs';
import useReRender from '../../hooks/re-render';
import useTippy from '../../hooks/tippy.mjs';
import getEvtTarget from '../../util/get-evt-target.mjs';
import {mkClass} from '../../util/mk-class.mjs';
import {BlockDiv} from '../block';
import Btn from '../btn';
import {ChevronDownSvg, ChevronUpSvg} from '../svg';
import {useTouched, useWorkflow} from './editor-contexts';
import type {WorkflowEditorHeaderBlockProps} from './header-block';
import WorkflowEditorHeaderBlock from './header-block';
import NewStep from './new-step/new-step';

type Props = WorkflowEditorHeaderBlockProps;

const WorkflowEditor = memo<Props>(function WorkflowEditor(props) {
  const [error, resetError] = useErrorBoundary();

  return error
    ? <WorkflowEditorErrored err={error} reset={resetError}/>
    : <WorkflowEditorInner {...props}/>;
});

export default WorkflowEditor;

interface ErrProps {
  err: Error;

  reset(): void;
}

function WorkflowEditorErrored({err, reset}: ErrProps): VNode {
  const workflow = useWorkflow();

  const focusTA = useCallback((e: Event) => {
    (e.target as HTMLTextAreaElement).select();
  }, EMPTY_ARR);

  const doReset = useCallback(() => {
    workflow.peek().resetSteps();
    reset();
  }, [reset, workflow]);

  return (
    <BlockDiv>
      <div class={'alert alert-danger text-center'}>
        <div class={'font-w600'}>An uncaught error occurred</div>
        <span>{'Please open a bug report on the mod\'s '}</span>
        <a href={'https://github.com/Alorel/melvor-action-workflows/issues/new/choose'}
          target={'_blank'}
          rel={'noopener'}>GitHub</a>
        <span>{' and include the stack trace below:'}</span>
      </div>
      <textarea class={'form-control'} readonly={true} onClick={focusTA}>{err.stack}</textarea>
      <Btn kind={'primary'} size={'block'} onClick={doReset}>Reset workflow</Btn>
    </BlockDiv>
  );
}

function WorkflowEditorInner(props: Props): VNode {
  const touched = useTouched();
  const workflow$ = useWorkflow();

  const workflow = workflow$.value;
  const extraClass = touched.value && 'ActionWorkflowsCore-touched';
  const reRender = useReRender();
  const onClickAddStep = useCallback((e: Event) => {
    const idx = parseInt((e.target as HTMLButtonElement).dataset.idx!);
    if (isNaN(idx)) {
      return;
    }

    workflow$.peek().addStep(idx + 1);
    reRender();
  }, [workflow$]);

  return (
    <Fragment>
      <div class={mkClass('row', extraClass)}>
        <WorkflowEditorHeaderBlock {...props}/>
      </div>
      <div class={mkClass('row row-deck', extraClass)}>
        {workflow.steps.map((step, idx): VNode => (
          <NewStep step={step} key={step.listId}>
            {workflow.canRemoveSteps && <RmStepsBtns reRender={reRender} idx={idx}/>}
            <Btn kind={'success'} data-idx={idx} onClick={onClickAddStep}>Add step</Btn>
          </NewStep>
        ))}
      </div>
    </Fragment>
  );
}

interface RmStepsBtnsProps extends Pick<ShiftStepBtnProps, 'idx'> {
  reRender(): void;
}

const RmStepsBtns: FunctionComponent<RmStepsBtnsProps> =
  ({reRender, idx}) => {
    const [shiftStepIdx, rmStep, workflow$] = useRmStepsBtnsCallbacks(reRender);
    const lastStepIdx = workflow$.value.steps.length - 1;

    return (
      <Fragment>
        <Btn kind={'danger'} data-idx={idx} onClick={rmStep}>Remove step</Btn>
        {idx !== 0 && (
          <StepShiftBtn idx={idx} shift={-1} onClick={shiftStepIdx}>
            <ChevronUpSvg/>
          </StepShiftBtn>
        )}
        {idx !== lastStepIdx && (
          <StepShiftBtn idx={idx} shift={1} onClick={shiftStepIdx}>
            <ChevronDownSvg/>
          </StepShiftBtn>
        )}
      </Fragment>
    );
  };

function useRmStepsBtnsCallbacks(reRender: () => void): [(e: Event) => void, (e: Event) => void, Signal<Workflow>] {
  const workflow = useWorkflow();

  const deps = [workflow, reRender];
  const shiftStepIdx = useCallback((e: Event): void => {
    const data = getEvtTarget(e, el => el.tagName === 'BUTTON')?.dataset;
    if (!data) {
      return;
    }

    const btnIdx = parseInt(data.idx!);
    if (isNaN(btnIdx)) {
      return;
    }

    const wf = workflow.peek();
    const shift = parseInt(data.shift!);
    if (isNaN(shift) || !swapElements(wf.steps, btnIdx, btnIdx + shift)) {
      return;
    }

    wf.markStepsChanged();
    reRender();
  }, deps);

  const rmStep = useCallback((e: Event): void => {
    const btnIdx = parseInt((e.target as HTMLButtonElement).dataset.idx!);
    if (!isNaN(btnIdx)) {
      workflow.peek().rmStep(btnIdx);
      reRender();
    }
  }, deps);

  return [shiftStepIdx, rmStep, workflow];
}

interface ShiftStepBtnProps {
  idx: number;

  shift: number;

  onClick(e: Event): void;
}

const StepShiftBtn = memo<ShiftStepBtnProps>(function StepShiftBtn({children, idx, shift, onClick}) {
  const ref = useTippy<HTMLButtonElement>(`Move this step ${shift === 1 ? 'down' : 'up'}`);

  return (
    <Btn kind={'light'}
      data-idx={idx}
      data-shift={shift}
      btnRef={ref}
      onClick={onClick}>
      {children}
    </Btn>
  );
});
