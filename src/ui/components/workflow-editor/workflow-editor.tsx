import type {Signal} from '@preact/signals';
import {useSignal} from '@preact/signals';
import type {VNode} from 'preact';
import {Fragment, h} from 'preact';
import type {FunctionComponent, HTMLAttributes} from 'preact/compat';
import {memo} from 'preact/compat';
import {useCallback, useErrorBoundary} from 'preact/hooks';
import type {Workflow} from '../../../lib/data/workflow.mjs';
import {warnLog} from '../../../lib/util/log.mjs';
import swapElements from '../../../lib/util/swap-elements.mjs';
import useTippy from '../../hooks/tippy.mjs';
import {useBehaviourSubject} from '../../hooks/use-subject.mjs';
import getEvtTarget from '../../util/get-evt-target.mjs';
import {mkClass} from '../../util/mk-class.mjs';
import {BlockDiv} from '../block';
import Btn from '../btn';
import HideableSection from '../hideable-section';
import {ChevronDownSvg, ChevronUpSvg} from '../svg';
import {UncaughtErrorBoilerplate} from '../uncaught-error-boilerplate';
import {EDITOR_SECTION_CLASS, useTouched, useWorkflow, WorkflowContext} from './editor-contexts';
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

  const doReset = useCallback(() => {
    workflow.peek().resetSteps();
    reset();
  }, [reset, workflow]);

  return (
    <UncaughtErrorBoilerplate err={err}>
      <Btn kind={'primary'} size={'block'} onClick={doReset}>Reset workflow</Btn>
    </UncaughtErrorBoilerplate>
  );
}

function WorkflowEditorInner(props: Props): VNode {
  let comp: any;
  let attrs: HTMLAttributes<HTMLDivElement> | null;

  if (useTouched().value) {
    comp = 'div';
    attrs = {class: 'ActionWorkflowsCore-touched'};
  } else {
    comp = Fragment;
    attrs = null;
  }

  const baseClass = props.embedded ? 'col-12' : EDITOR_SECTION_CLASS;

  return h(
    comp,
    attrs,
    <div class={'row'}>
      <WorkflowEditorHeaderBlock {...props}/>
    </div>,
    <BlockDiv class={baseClass}>
      <HideableSection heading={'Steps'} startOpen={!props.embedded}>
        <Steps/>
      </HideableSection>
    </BlockDiv>,
    !props.embedded && (
      <BlockDiv class={`${baseClass} mt-4`}>
        <HideableSection heading={<EmbeddedWorkflowsHeader/>}>
          <EmbeddedWorkflows/>
        </HideableSection>
      </BlockDiv>
    )
  );
}

const EmbeddedWorkflowsHeader = memo(function EmbeddedWorkflowsHeader() {
  return (
    <Fragment>
      <span>Embedded workflows</span>
      <EmbeddedWorkflowCounter/>
    </Fragment>
  );
});

function EmbeddedWorkflowCounter() {
  const count = useBehaviourSubject(useWorkflow().value.embeddedWorkflows$).length;
  const style = count ? 'primary' : 'secondary';

  return <span class={`badge ml-1 text-bg-${style} bg-${style}`}>{count}</span>;
}

const EmbeddedWorkflows = memo(function EmbeddedWorkflows(): VNode {
  const workflow$ = useWorkflow();
  const embeddedWorkflows = useBehaviourSubject(workflow$.value.embeddedWorkflows$);

  const onClickAdd = useCallback(() => {
    workflow$.peek().addEmbeddedWorkflow(0);
  }, [workflow$]);

  return (
    <Fragment>
      <div class={mkClass('btn-group btn-group-sm', embeddedWorkflows.length && 'mb-3')}>
        <Btn kind={'success'} onClick={onClickAdd}>Add embedded workflow</Btn>
      </div>
      {embeddedWorkflows.map(embeddedWorkflow)}
    </Fragment>
  );
});

function embeddedWorkflow(workflow: Workflow): VNode {
  return (
    <HideableSection heading={workflow.name || <span class={'text-danger'} key={workflow.listId}>[Unnamed]</span>}>
      <EmbeddedWorkflow workflow={workflow}/>
    </HideableSection>
  );
}

interface EmbeddedWorkflowProps {
  workflow: Workflow;
}

const EmbeddedWorkflow = memo<EmbeddedWorkflowProps>(function EmbeddedWorkflow({workflow}) {
  const hostWorkflow$ = useWorkflow();

  const editedWorkflow$ = useSignal(workflow);
  editedWorkflow$.value = workflow;

  const onDelete = useCallback(() => {
    const hostWorkflow = hostWorkflow$.peek();
    const editedWorkflow = editedWorkflow$.peek();
    const idx = hostWorkflow.embeddedWorkflows.findIndex(wf => wf.listId === editedWorkflow.listId);
    if (idx === -1) {
      warnLog('Embedded workflow not found for removal:', editedWorkflow);

      return;
    }

    hostWorkflow.rmEmbeddedWorkflow(idx);
  }, [hostWorkflow$, editedWorkflow$]);

  return (
    <WorkflowContext.Provider value={editedWorkflow$}>
      <WorkflowEditor embedded={true}>
        <Btn kind={'danger'} size={'sm'} onClick={onDelete}>Delete workflow</Btn>
      </WorkflowEditor>
    </WorkflowContext.Provider>
  );
});

const Steps = memo(function Steps(): VNode {
  const workflow$ = useWorkflow();
  const workflow = workflow$.value;
  const steps = useBehaviourSubject(workflow.steps$);

  const onClickAddStep = useCallback((e: Event) => {
    const idx = parseInt((e.target as HTMLButtonElement).dataset.idx!);
    if (isNaN(idx)) {
      return;
    }

    workflow$.peek().addStep(idx + 1);
  }, [workflow$]);

  return (
    <div class={'row row-deck'}>
      {steps.map((step, idx): VNode => (
        <NewStep step={step} key={step.listId}>
          {workflow.canRemoveSteps && <RmStepsBtns idx={idx}/>}
          <Btn kind={'success'} data-idx={idx} onClick={onClickAddStep}>Add step</Btn>
        </NewStep>
      ))}
    </div>
  );
});

type RmStepsBtnsProps = Pick<ShiftStepBtnProps, 'idx'>;

const RmStepsBtns: FunctionComponent<RmStepsBtnsProps> =
  ({idx}) => {
    const [shiftStepIdx, rmStep, workflow$] = useRmStepsBtnsCallbacks();
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

function useRmStepsBtnsCallbacks(): [(e: Event) => void, (e: Event) => void, Signal<Workflow>] {
  const workflow$ = useWorkflow();

  const deps = [workflow$];
  const shiftStepIdx = useCallback((e: Event): void => {
    const data = getEvtTarget(e, el => el.tagName === 'BUTTON')?.dataset;
    if (!data) {
      return;
    }

    const btnIdx = parseInt(data.idx!);
    if (isNaN(btnIdx)) {
      return;
    }

    const wf = workflow$.peek();
    const shift = parseInt(data.shift!);
    if (isNaN(shift) || !swapElements(wf.steps, btnIdx, btnIdx + shift)) {
      return;
    }

    wf.markStepsChanged();
  }, deps);

  const rmStep = useCallback((e: Event): void => {
    const btnIdx = parseInt((e.target as HTMLButtonElement).dataset.idx!);
    if (!isNaN(btnIdx)) {
      workflow$.peek().rmStep(btnIdx);
    }
  }, deps);

  return [shiftStepIdx, rmStep, workflow$];
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
