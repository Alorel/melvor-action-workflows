import type {VNode} from 'preact';
import {Fragment} from 'preact';
import type {FunctionComponent} from 'preact/compat';
import {memo} from 'preact/compat';
import {useCallback, useContext} from 'preact/hooks';
import type {Workflow} from '../../../lib/data/workflow.mjs';
import swapElements from '../../../lib/util/swap-elements.mjs';
import useReRender from '../../hooks/re-render';
import useTippy from '../../hooks/tippy.mjs';
import getEvtTarget from '../../util/get-evt-target.mjs';
import {mkClass} from '../../util/mk-class.mjs';
import Btn from '../btn';
import {ChevronDownSvg, ChevronUpSvg} from '../svg';
import {EDITOR_CTX} from './editor-ctx.mjs';
import type {WorkflowEditorHeaderBlockProps} from './header-block';
import WorkflowEditorHeaderBlock from './header-block';
import NewStep from './new-step/new-step';

type Props = WorkflowEditorHeaderBlockProps;

const WorkflowEditor = memo<Props>(props => {
  const {touched, workflow} = useContext(EDITOR_CTX)!;
  const reRender = useReRender();
  const onClickAddStep = useCallback((e: Event) => {
    const idx = parseInt((e.target as HTMLButtonElement).dataset.idx!);
    if (isNaN(idx)) {
      return;
    }

    workflow.addStep(idx + 1);
    reRender();
  }, [workflow]);

  return (
    <Fragment>
      <WorkflowEditorHeaderBlock {...props}/>
      <div className={mkClass('row row-deck', touched.value && 'ActionWorkflowsCore-touched')}>
        {workflow.steps.map((step, idx): VNode => (
          <NewStep step={step} key={step.listId}>
            {workflow.canRemoveSteps && <RmStepsBtns workflow={workflow} reRender={reRender} idx={idx}/>}
            <Btn kind={'success'} data-idx={idx} onClick={onClickAddStep}>Add step</Btn>
          </NewStep>
        ))}
      </div>
    </Fragment>
  );
});

export default WorkflowEditor;

interface RmStepsBtnsProps extends Pick<ShiftStepBtnProps, 'idx'> {
  workflow: Workflow;

  reRender(): void;
}

const RmStepsBtns: FunctionComponent<RmStepsBtnsProps> =
  ({reRender, workflow, idx}) => {
    const lastStepIdx = workflow.steps.length - 1;

    const shiftStepIdx = useCallback((e: Event): void => {
      const data = getEvtTarget(e, el => el.tagName === 'BUTTON')?.dataset;
      if (!data) {
        return;
      }

      const btnIdx = parseInt(data.idx!);
      if (isNaN(btnIdx)) {
        return;
      }

      const shift = parseInt(data.shift!);
      if (isNaN(shift) || !swapElements(workflow.steps, btnIdx, btnIdx + shift)) {
        return;
      }

      reRender();
    }, [workflow, reRender]);

    const rmStep = useCallback((e: Event): void => {
      const btnIdx = parseInt((e.target as HTMLButtonElement).dataset.idx!);
      if (!isNaN(btnIdx)) {
        workflow.rmStep(btnIdx);
        reRender();
      }
    }, [workflow, reRender]);

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

interface ShiftStepBtnProps {
  idx: number;

  shift: number;

  onClick(e: Event): void;
}

const StepShiftBtn = memo<ShiftStepBtnProps>(({children, idx, shift, onClick}) => {
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
