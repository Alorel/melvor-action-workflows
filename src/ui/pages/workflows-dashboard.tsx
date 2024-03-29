import type {Signal} from '@preact/signals';
import {batch, useComputed} from '@preact/signals';
import type {VNode} from 'preact';
import {memo} from 'preact/compat';
import {useCallback, useEffect, useErrorBoundary} from 'preact/hooks';
import {of, switchMap} from 'rxjs';
import type {Workflow} from '../../lib/data/workflow.mjs';
import WorkflowRegistry from '../../lib/registries/workflow-registry.mjs';
import swapElements from '../../lib/util/swap-elements.mjs';
import {BlockDiv, BorderedBlock} from '../components/block';
import Btn from '../components/btn';
import PageContainer from '../components/page-container';
import {UncaughtErrorBoilerplate} from '../components/uncaught-error-boilerplate';
import {
  useActiveWorkflow,
  useActiveWorkflowHost,
  useEditedWorkflow,
  useEditedWorkflowHost,
  useTouchedHost,
  useWorkflowHost,
  WorkflowContext
} from '../components/workflow-editor/editor-contexts';
import WorkflowEditor from '../components/workflow-editor/workflow-editor';
import {useActiveStepIdx, useActiveStepIdxHost, useBorderClass, useRunning} from '../global-ctx';
import useReRender from '../hooks/re-render';
import {useBehaviourSubject} from '../hooks/use-subject.mjs';
import autoId from '../util/id-gen.mjs';
import {ActiveWorkflowSelect} from './workflows-dashboard/active-workflow-select';
import {SelectedWorkflowBtns} from './workflows-dashboard/btns';
import type {DashboardStepProps} from './workflows-dashboard/dashboard-step';
import DashboardStep from './workflows-dashboard/dashboard-step';
import {NoDashboardsDefined} from './workflows-dashboard/no-dashboards-defined';

export const WORKFLOWS_DASHBOARD_ID = autoId();

function WithWorkflows({workflows}: Pick<EditorProps, 'workflows'>): VNode {
  const [ProvideEditedWorkflow, editedWorkflow$] = useEditedWorkflowHost();
  const [ProvideActiveWorkflow] = useActiveWorkflowHost(WorkflowRegistry.inst.primaryExecution?.workflow);

  return (
    <ProvideEditedWorkflow>
      <ProvideActiveWorkflow>
        {editedWorkflow$.value ? <Editor/> : <DashboardShell workflows={workflows}/>}
      </ProvideActiveWorkflow>
    </ProvideEditedWorkflow>
  );
}

export default function WorkflowsDashboard(): VNode {
  return (
    <PageContainer id={WORKFLOWS_DASHBOARD_ID}>
      <div class={'row'}>
        <div class={'col-12 col-xl-11 m-auto'}>
          <Inner/>
        </div>
      </div>
    </PageContainer>
  );
}

function useWorkflowRemovalCorrector(
  workflows: Workflow[],
  activeWorkflow$: Signal<Workflow | undefined>
): void {
  const activeId = activeWorkflow$.value?.listId;

  useEffect(() => {
    if (activeId !== undefined && !workflows.some(wf => wf.listId === activeId)) {
      activeWorkflow$.value = undefined;
    }
  }, [activeId, workflows]);
}

interface EditorProps {
  workflows: Workflow[];
}

function DashboardShell({workflows}: EditorProps): VNode {
  const reg = WorkflowRegistry.inst;
  const activeWorkflow = useActiveWorkflow();
  const reRender = useReRender();
  const hasWorkflow = Boolean(activeWorkflow.value);

  const [ProvideWorkflow, workflow$] = useWorkflowHost(activeWorkflow.peek());
  workflow$.value = activeWorkflow.peek()!;

  const [ProvideActiveStepIdx, activeStepIdx$] = useActiveStepIdxHost(-1);

  useEffect(() => {
    const sub = reg.primaryExecution$
      .pipe(switchMap(exec => exec?.activeStepIdx$ ?? of(-1)))
      .subscribe(v => {
        activeStepIdx$.value = v;
      });
    return () => {
      sub.unsubscribe();
    };
  });

  useWorkflowRemovalCorrector(workflows, activeWorkflow);

  return (
    <ProvideActiveStepIdx>
      <ProvideWorkflow>
        <BlockDiv>
          <div className={'row'}>
            <ActiveWorkflowSelect workflows={workflows}/>
            <div className={'col-xs-12 text-center col-md-auto'}>
              {
                hasWorkflow
                  ? <SelectedWorkflowBtns refresh={reRender}/>
                  : 'Select a workflow to get started'
              }
            </div>
          </div>
        </BlockDiv>

        {hasWorkflow && <RenderSteps/>}
      </ProvideWorkflow>
    </ProvideActiveStepIdx>
  );
}

const RenderSteps = memo(function RenderSteps() {
  const [error, resetError] = useErrorBoundary();
  const activeWorkflow$ = useActiveWorkflow();

  const doReset = useCallback(() => {
    batch(() => {
      activeWorkflow$.value = undefined;
      WorkflowRegistry.inst.setPrimaryExecution();
    });
    resetError();
  }, [activeWorkflow$, resetError]);

  if (error) {
    return (
      <UncaughtErrorBoilerplate err={error}>
        <Btn kind={'primary'} size={'block'} onClick={doReset}>Reset</Btn>
      </UncaughtErrorBoilerplate>
    );
  }

  return error
    ? <UncaughtErrorBoilerplate err={error}/>
    : <RenderStepsInner/>;
});

function RenderStepsInner() {
  const reRender = useReRender();
  const activeStepIdx = useActiveStepIdx();
  const running = useRunning();
  const activeWorkflow = useActiveWorkflow();
  const borderClass = useBorderClass();
  const reg = WorkflowRegistry.inst;

  type StepProps = Pick<DashboardStepProps, 'mvLeft' | 'mvRight' | 'setActive'>;
  const stepProps = useComputed((): StepProps[] => {
    const activeIdx = activeStepIdx.value;
    const isRunning = running.value;

    return activeWorkflow.value!.steps.map((_step, idx, arr): StepProps => ({
      mvLeft: idx !== 0 && activeIdx !== idx && activeIdx !== idx - 1,
      mvRight: idx !== (arr.length - 1) && activeIdx !== idx && activeIdx !== idx + 1,
      setActive: isRunning && activeIdx !== idx,
    }));
  }).value;

  const onShift = useCallback((idx: number, direction: 1 | -1): void => {
    const workflow = activeWorkflow.peek()!;
    if (!swapElements(workflow.steps, idx, idx + direction)) {
      return;
    }

    reg.save();
    reRender();
  }, [activeWorkflow]);

  return (
    <BorderedBlock kind={borderClass.value} size={4} class={'mt-2'}>
      <div class={'row row-deck'}>
        {activeWorkflow.value!.steps.map((step, idx) => (
          <DashboardStep key={step.listId}
            onShift={direction => {
              onShift(idx, direction);
            }}
            onSetActive={() => {
                           reg.primaryExecution!.setActiveStepIdx(idx);
            }}
            step={step}
            {...stepProps[idx]}/>
        ))}
      </div>
    </BorderedBlock>
  );
}

function Editor(): VNode {
  const editedWorkflow$ = useEditedWorkflow();
  const activeWorkflow$ = useActiveWorkflow();
  const [ProvideTouched, touched$] = useTouchedHost(false);

  const onCancel = useCallback(() => {
    editedWorkflow$.value = undefined;
  }, [editedWorkflow$]);
  const onSave = useCallback(() => {
    const wf = editedWorkflow$.peek();
    const {
      listId: activeWorkflowId,
      name: activeWorkflowName,
    } = activeWorkflow$.peek()!;

    if (!wf?.isValid(activeWorkflowName)) {
      touched$.value = true;
      return;
    }

    const reg = WorkflowRegistry.inst;
    const idx = reg.workflows.findIndex(w => w.listId === activeWorkflowId);

    if (idx === -1) {
      return;
    }

    batch(() => {
      reg.patch(wf, idx);
      activeWorkflow$.value = wf;
      editedWorkflow$.value = undefined;
    });
  }, [editedWorkflow$, activeWorkflow$]);

  return (
    <WorkflowContext.Provider value={editedWorkflow$ as Signal<Workflow>}>
      <ProvideTouched>
        <WorkflowEditor onSave={onSave} permitDupeName={activeWorkflow$.value?.name}>
          <Btn kind={'danger'} size={'sm'} onClick={onCancel}>{'Cancel'}</Btn>
        </WorkflowEditor>
      </ProvideTouched>
    </WorkflowContext.Provider>
  );
}

function Inner(): VNode {
  const workflows = useBehaviourSubject(WorkflowRegistry.inst.workflows$);

  return workflows.length
    ? (<WithWorkflows workflows={workflows}/>)
    : (<NoDashboardsDefined/>);
}
