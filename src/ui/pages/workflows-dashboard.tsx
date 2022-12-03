import {staticComponent} from '@alorel/preact-static-component';
import type {Signal} from '@preact/signals';
import {batch, useComputed} from '@preact/signals';
import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {memo} from 'preact/compat';
import {useCallback, useEffect, useRef} from 'preact/hooks';
import {of, switchMap} from 'rxjs';
import {Workflow} from '../../lib/data/workflow.mjs';
import WorkflowRegistry from '../../lib/registries/workflow-registry.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import {alertConfirm} from '../../lib/util/alert';
import swapElements from '../../lib/util/swap-elements.mjs';
import {BorderedBlock} from '../components/block';
import Btn from '../components/btn';
import PageContainer from '../components/page-container';
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
import type {DashboardStepProps} from './workflows-dashboard/dashboard-step';
import DashboardStep from './workflows-dashboard/dashboard-step';
import {NoDashboardsDefined} from './workflows-dashboard/no-dashboards-defined';

export const WORKFLOWS_DASHBOARD_ID = autoId();

function WithWorkflows({workflows}: Pick<EditorProps, 'workflows'>): VNode {
  const [ProvideEditedWorkflow, editedWorkflow$] = useEditedWorkflowHost();
  const [ProvideActiveWorkflow] = useActiveWorkflowHost();

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
      <div className={'row'}>
        <div className={'col-12 col-xl-11 m-auto'}>
          <div className={'block block-rounded'}>
            <div className={'block-content'}>
              <Inner/>
            </div>
          </div>
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
        <div className={'row'}>
          <ActiveWorkflowSelect workflows={workflows}/>
          <div class={'col-xs-12 text-center col-md-auto'}>
            {
              hasWorkflow
                ? <SelectedWorkflowBtns refresh={reRender}/>
                : 'Select a workflow to get started'
            }
          </div>

        </div>

        {hasWorkflow && <RenderSteps/>}
      </ProvideWorkflow>
    </ProvideActiveStepIdx>
  );
}

const RenderSteps = memo(() => {
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
});

function ActiveWorkflowSelect({workflows}: Pick<EditorProps, 'workflows'>): VNode {
  const activeWorkflow$ = useActiveWorkflow();
  const wfsRef = useRef(workflows);
  wfsRef.current = workflows;

  const onWorkflowChange = useCallback((e: Event) => {
    const listId = parseInt((e.target as HTMLSelectElement).value);

    batch(() => {
      activeWorkflow$.value = isNaN(listId) ? undefined : wfsRef.current.find(wf => wf.listId === listId);
      WorkflowRegistry.inst.setPrimaryExecution(); // unset, really
    });
  }, [activeWorkflow$]);

  return (
    <Fragment>
      <div className={'col-xs-12 col-sm-4 col-md-auto font-w600 font-size-sm pr-1'}>Active workflow</div>
      <div className={'col-xs-12 col-sm-8 col-md-auto'}>
        <select className={'form-control form-control-sm'} value={activeWorkflow$.value?.listId ?? ''}
          onChange={onWorkflowChange}>
          {workflows.map(wf => <option key={wf.listId} value={wf.listId}>{wf.name}</option>)}
        </select>
      </div>
    </Fragment>
  );
}

interface SelectedWorkflowBtnsProps {
  refresh(): void;
}

const SelectedWorkflowBtns = memo<SelectedWorkflowBtnsProps>(
  ({refresh}) => {
    const running = useRunning().value;

    return running ? <BtnsRunning/> : <BtnsNotRunning refresh={refresh}/>;
  }
);

function useNestedRefresh(refresh: () => void): () => void {
  const ownRefresh = useReRender();
  return useCallback(() => {
    ownRefresh();
    refresh();
  }, [refresh]);
}

function BtnsNotRunning({refresh}: SelectedWorkflowBtnsProps): VNode {
  const activeWorkflow = useActiveWorkflow();
  const editedWorkflow = useEditedWorkflow();
  const doRefresh = useNestedRefresh(refresh);

  const reg = WorkflowRegistry.inst;
  const run = useCallback(() => {
    reg.setPrimaryExecution(activeWorkflow.peek(), true);
    doRefresh();
  }, [activeWorkflow, doRefresh]);

  const startEditing = useCallback(() => {
    batch(() => {
      editedWorkflow.value = Workflow.fromJSON(JSON.parse(JSON.stringify(activeWorkflow.peek())));
      reg.setPrimaryExecution();
    });
  }, [editedWorkflow, activeWorkflow]);

  const del = useCallback(() => {
    const activeWf = activeWorkflow.peek()!;

    alertConfirm(`Are you sure you want to delete "${activeWf.name}"?`)
      .subscribe(() => {
        batch(() => {
          activeWorkflow.value = undefined;
          reg.rmByIdx(reg.workflows.findIndex(wf => wf.listId === activeWf.listId));
          doRefresh();
        });
      });
  }, [activeWorkflow, doRefresh]);

  const clone = useCallback(() => {
    const cloned = Workflow.fromJSON(JSON.parse(JSON.stringify(activeWorkflow.peek()!)))!;
    cloned.name += ` [copied ${new Date().toLocaleString()}]`;

    reg.add(cloned);
    activeWorkflow.value = cloned;
  }, [activeWorkflow]);

  return (
    <div class={'btn-group btn-group-sm'}>
      <Btn kind={'success'} onClick={run}>{'Run'}</Btn>
      <Btn kind={'primary'} onClick={startEditing}>{'Edit'}</Btn>
      <Btn kind={'primary'} onClick={clone}>{'Copy'}</Btn>
      <Btn kind={'danger'} onClick={del}>{'Delete'}</Btn>
    </div>
  );
}

const BtnsRunning = staticComponent(() => {
  const onClick = useCallback(() => {
    WorkflowRegistry.inst.setPrimaryExecution(); // unset
  }, EMPTY_ARR);

  return (<Btn kind={'danger'} size={'sm'} onClick={onClick}>{'Stop'}</Btn>);
});

function Editor(): VNode {
  const editedWorkflow$ = useEditedWorkflow();
  const activeWorkflow$ = useActiveWorkflow();
  const [ProvideTouched, touched$] = useTouchedHost(false);

  const onCancel = useCallback(() => {
    editedWorkflow$.value = undefined;
  }, [editedWorkflow$]);
  const onSave = useCallback(() => {
    const wf = editedWorkflow$.peek();
    if (!wf?.isValid) {
      touched$.value = true;
      return;
    }

    const reg = WorkflowRegistry.inst;
    const activeWorkflowId = activeWorkflow$.peek()!.listId;
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
        <WorkflowEditor onSave={onSave}>
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
