import {staticComponent} from '@alorel/preact-static-component';
import {distinctWithInitial} from '@aloreljs/rxutils/operators';
import type {ReadonlySignal, Signal} from '@preact/signals';
import {batch, useComputed, useSignal} from '@preact/signals';
import type {VNode} from 'preact';
import {Fragment, h} from 'preact';
import {memo} from 'preact/compat';
import {useCallback, useEffect} from 'preact/hooks';
import type {Observable} from 'rxjs';
import {distinctUntilChanged, EMPTY, map, merge, of, skip, switchMap} from 'rxjs';
import {Workflow} from '../../lib/data/workflow.mjs';
import type {WorkflowCompleteEvent, WorkflowEvent} from '../../lib/execution/workflow-event.mjs';
import {WorkflowEventType} from '../../lib/execution/workflow-event.mjs';
import type {WorkflowExecution} from '../../lib/execution/workflow-execution.mjs';
import WorkflowRegistry from '../../lib/registries/workflow-registry.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import {BorderedBlock} from '../components/block';
import Btn from '../components/btn';
import {EDITOR_CTX, useEditorCtxProvider} from '../components/workflow-editor/editor-ctx.mjs';
import WorkflowEditor from '../components/workflow-editor/workflow-editor';
import useReRender from '../hooks/re-render';
import {useBehaviourSubject} from '../hooks/use-subject.mjs';
import autoId from '../id-gen.mjs';
import {sidebarItems} from '../sidebar-mgr.mjs';
import DashboardStep from './workflows-dashboard/dashboard-step';

export const WORKFLOWS_DASHBOARD_ID = autoId();

function Inner(): VNode {
  const workflows = useBehaviourSubject(WorkflowRegistry.inst.workflows$);

  return workflows.length
    ? (<WithWorkflows workflows={workflows}/>)
    : (<NoDashboardsDefined/>);
}

export default function WorkflowsDashboard(): VNode {
  return (
    <div className={'row'}>
      <div className={'col-12 col-xl-11 m-auto'}>
        <div className={'block block-rounded'}>
          <div className={'block-content'}>
            <Inner/>
          </div>
        </div>
      </div>
    </div>
  );
}

type EditorProps = ReturnType<typeof useEditorProps>;

function useEditorProps(workflows: Workflow[]) {
  const activeWorkflow = useSignal<Workflow | undefined>(undefined);
  const activeWorkflowId = useComputed((): number | undefined => activeWorkflow.value?.listId);
  const editedWorkflow = useSignal<Workflow | undefined>(undefined);

  return {
    activeWorkflow,
    activeWorkflowId,
    editedWorkflow,
    workflows,
    ...usePrimaryExecutionSignal(),
  } as const;
}

function usePrimaryExecutionSignal() {
  const enum Strings {
    STD_CLASS = 'summoning',
  }

  const reg = WorkflowRegistry.inst;
  const running = useSignal(false);
  const activeStepIdx = useSignal(-1);
  const borderClass = useSignal<string>(Strings.STD_CLASS);

  useEffect(() => {
    const sub = reg.primaryExecution$
      .pipe(
        distinctUntilChanged((a, b) => a?.id === b?.id),
        switchMap(exec => {
          if (!exec) {
            batch(() => {
              running.value = false;
              activeStepIdx.value = -1;
              borderClass.value = Strings.STD_CLASS;
            });

            return EMPTY;
          }

          running.value = true;

          const border$ = exec.pipe(
            switchMap(evtTypeMapper),
            distinctWithInitial<string>(Strings.STD_CLASS)
          );
          const stepIdx$ = getStepIdx(exec, activeStepIdx);

          return merge(border$, stepIdx$);
        })
      )
      .subscribe(border => {
        borderClass.value = border;
      });

    return () => {
      sub.unsubscribe();
    };
  }, [borderClass, activeStepIdx]);

  return {
    activeStepIdx: activeStepIdx as ReadonlySignal<number>,
    borderClass: borderClass as ReadonlySignal<string>,
    running: running as ReadonlySignal<boolean>,
  } as const;
}

function getStepIdx(exec: WorkflowExecution, activeStepIdx: Signal<number>): Observable<never> {
  return exec.pipe(
    map(() => exec.activeStepIdx),
    distinctWithInitial(activeStepIdx.peek()),
    skip(1),
    switchMap((idx): Observable<never> => {
      activeStepIdx.value = idx;

      return EMPTY;
    })
  );
}

function DashboardShell({
  activeWorkflow,
  borderClass,
  activeWorkflowId,
  running,
  editedWorkflow,
  workflows,
}: EditorProps): VNode {
  const reg = WorkflowRegistry.inst;
  const onWorkflowChange = useCallback((e: Event) => {
    const listId = parseInt((e.target as HTMLSelectElement).value);

    batch(() => {
      activeWorkflow.value = isNaN(listId) ? undefined : reg.getWorkflow(listId);
      reg.setPrimaryExecution(); // unset, really
    });
  }, [workflows, activeWorkflow]);

  const reRender = useReRender();

  return (
    <Fragment>
      <div className={'row'}>
        <div className={'col-auto font-w600 font-size-sm pr-1'}>Active workflow</div>
        <div className={'col-auto'}>
          <select className={'form-control form-control-sm'} value={activeWorkflowId.value ?? ''}
            onChange={onWorkflowChange}>
            {workflows.map(wf => <option key={wf.listId} value={wf.listId}>{wf.name}</option>)}
          </select>
        </div>

        {activeWorkflow.value && (
          <SelectedWorkflowBtns running={running}
            refresh={reRender}
            editedWorkflow={editedWorkflow}
            activeWorkflow={activeWorkflow}/>
        )}
      </div>

      {activeWorkflow.value && <RenderSteps activeWorkflow={activeWorkflow} borderClass={borderClass}/>}
    </Fragment>
  );
}

const RenderSteps = memo<Pick<EditorProps, 'activeWorkflow' | 'borderClass'>>(
  ({activeWorkflow, borderClass}) => (
    <BorderedBlock kind={borderClass.value} size={4} class={'mt-2'}>
      <div class={'row row-deck'}>
        {activeWorkflow.value!.steps.map(step => <DashboardStep key={step.listId} step={step}/>)}
      </div>
    </BorderedBlock>
  )
);

interface SelectedWorkflowBtnsProps extends Pick<EditorProps, 'activeWorkflow' | 'editedWorkflow' | 'running'> {
  refresh(): void;
}

const SelectedWorkflowBtns = memo<SelectedWorkflowBtnsProps>(
  ({running, ...rest}) => (
    <div className={'col-auto'}>
      {running.value ? <BtnsRunning/> : <BtnsNotRunning {...rest}/>}
    </div>
  )
);

function useNestedRefresh(refresh: () => void): () => void {
  const ownRefresh = useReRender();
  return useCallback(() => {
    ownRefresh();
    refresh();
  }, [refresh]);
}

type BtnsNotRunningProps = Omit<SelectedWorkflowBtnsProps, 'running'>;
const BtnsNotRunning = memo<BtnsNotRunningProps>(
  ({activeWorkflow, editedWorkflow, refresh}) => {
    const doRefresh = useNestedRefresh(refresh);

    const reg = WorkflowRegistry.inst;
    const run = useCallback(() => {
      reg.setPrimaryExecution(activeWorkflow.peek()!);
      doRefresh();
    }, [activeWorkflow, doRefresh]);
    const startEditing = useCallback(() => {
      batch(() => {
        editedWorkflow.value = Workflow.fromJSON(JSON.parse(JSON.stringify(activeWorkflow.peek())));
        reg.setPrimaryExecution();
      });
    }, [editedWorkflow, activeWorkflow]);
    const del = useCallback(() => {
      const activeId = activeWorkflow.peek()!.listId;
      batch(() => {
        activeWorkflow.value = undefined;
        reg.rmByIdx(reg.workflows.findIndex(wf => wf.listId === activeId));
        doRefresh();
      });
    }, [activeWorkflow, doRefresh]);

    return (
      <div class={'btn-group btn-group-sm'}>
        <Btn kind={'success'} onClick={run}>{'Run'}</Btn>
        <Btn kind={'primary'} onClick={startEditing}>{'Edit'}</Btn>
        <Btn kind={'danger'} onClick={del}>{'Delete'}</Btn>
      </div>
    );
  }
);

const BtnsRunning = staticComponent(() => {
  const onClick = useCallback(() => {
    WorkflowRegistry.inst.setPrimaryExecution(); // unset
  }, EMPTY_ARR);

  return (<Btn kind={'danger'} size={'sm'} onClick={onClick}>{'Stop'}</Btn>);
});

function Editor({activeWorkflow, editedWorkflow: editedWorkflowIn}: EditorProps): VNode {
  const [editedWorkflow, editorCtx] = useEditorCtxProvider(editedWorkflowIn);
  const ProvideEditorCtx = EDITOR_CTX.Provider;

  const onCancel = useCallback(() => {
    editedWorkflow.value = undefined;
  }, [editedWorkflow]);
  const onSave = useCallback(() => {
    const wf = editedWorkflow.peek();
    if (!wf?.isValid) {
      editorCtx.peek().touched.value = true;
      return;
    }

    const reg = WorkflowRegistry.inst;
    const activeWorkflowId = activeWorkflow.peek()!.listId;
    const idx = reg.workflows.findIndex(w => w.listId === activeWorkflowId);

    if (idx === -1) {
      return;
    }

    batch(() => {
      reg.patch(wf, idx);
      activeWorkflow.value = wf;
      editedWorkflow.value = undefined;
    });
  }, [editedWorkflow, activeWorkflow]);

  return (
    <ProvideEditorCtx value={editorCtx.value}>
      <WorkflowEditor onSave={onSave}>
        <Btn kind={'danger'} size={'sm'} onClick={onCancel}>{'Cancel'}</Btn>
      </WorkflowEditor>
    </ProvideEditorCtx>
  );
}

function WithWorkflows({workflows}: {workflows: Workflow[]}): VNode {
  const props = useEditorProps(workflows);

  return h<EditorProps>(props.editedWorkflow.value ? Editor : DashboardShell, props);
}

const NoDashboardsDefined = staticComponent(() => {
  const openWorkflowPage = useCallback((e: Event) => {
    e.preventDefault();
    sidebarItems.value.newWorkflow.click();
  }, EMPTY_ARR);

  return (
    <div class={'alert alert-info text-center'}>
      <span>{'You haven\'t defined any workflows! Go! '}</span>
      <a href={'#'} onClick={openWorkflowPage}>
        <span>{'Do this '}</span>
        <strong>{'now!'}</strong>
      </a>
    </div>
  );
});

function evtTypeMapper(evt: WorkflowEvent): Observable<string> {
  switch (evt.type) {
    case WorkflowEventType.WORKFLOW_START:
      return of('agility');
    case WorkflowEventType.WORKFLOW_COMPLETE:
      return of((evt as WorkflowCompleteEvent).ok ? 'woodcutting' : 'fletching');
    default:
      return EMPTY;
  }
}
