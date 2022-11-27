import {staticComponent} from '@alorel/preact-static-component';
import {distinctWithInitial} from '@aloreljs/rxutils/operators';
import type {ReadonlySignal, Signal} from '@preact/signals';
import {batch, useComputed, useSignal} from '@preact/signals';
import type {VNode} from 'preact';
import {Fragment, h} from 'preact';
import {memo} from 'preact/compat';
import {useCallback, useEffect, useRef} from 'preact/hooks';
import type {Observable, OperatorFunction} from 'rxjs';
import {distinctUntilChanged, EMPTY, map, merge, of, skip, switchMap} from 'rxjs';
import {Workflow} from '../../lib/data/workflow.mjs';
import type {WorkflowCompleteEvent, WorkflowEvent} from '../../lib/execution/workflow-event.mjs';
import {WorkflowEventType} from '../../lib/execution/workflow-event.mjs';
import type {WorkflowExecution} from '../../lib/execution/workflow-execution.mjs';
import WorkflowRegistry from '../../lib/registries/workflow-registry.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import swapElements from '../../lib/util/swap-elements.mjs';
import {BorderedBlock} from '../components/block';
import Btn from '../components/btn';
import {EDITOR_CTX, useEditorCtxProvider} from '../components/workflow-editor/editor-ctx.mjs';
import WorkflowEditor from '../components/workflow-editor/workflow-editor';
import useReRender from '../hooks/re-render';
import {useBehaviourSubject} from '../hooks/use-subject.mjs';
import autoId from '../id-gen.mjs';
import type {DashboardStepProps} from './workflows-dashboard/dashboard-step';
import DashboardStep from './workflows-dashboard/dashboard-step';
import {NoDashboardsDefined} from './workflows-dashboard/no-dashboards-defined';

/* eslint-disable max-lines */

const enum Strings {
  STD_CLASS = 'summoning',
}

export const WORKFLOWS_DASHBOARD_ID = autoId();

function WithWorkflows({workflows}: {workflows: Workflow[]}): VNode {
  const props = useEditorProps(workflows);

  return h<EditorProps>(props.editedWorkflow.value ? Editor : DashboardShell, props);
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
            eventToBorder(running),
            distinctWithInitial<string>(Strings.STD_CLASS)
          );
          const stepIdxNever$ = getStepIdx(exec, activeStepIdx);

          return merge(border$, stepIdxNever$);
        })
      )
      .subscribe(border => {
        borderClass.value = border;
      });

    return () => {
      sub.unsubscribe();
    };
  }, EMPTY_ARR);

  return {
    activeStepIdx: activeStepIdx as ReadonlySignal<number>,
    borderClass: borderClass as ReadonlySignal<string>,
    running: running as ReadonlySignal<boolean>,
  } as const;
}

function eventToBorder(running: Signal<boolean>): OperatorFunction<WorkflowEvent, string> {
  return switchMap(evt => {
    switch (evt.type) {
      case WorkflowEventType.WORKFLOW_START:
        return of('agility');
      case WorkflowEventType.WORKFLOW_COMPLETE:
        running.value = false;
        return of((evt as WorkflowCompleteEvent).ok ? 'woodcutting' : 'fletching');
      default:
        return EMPTY;
    }
  });
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
  activeStepIdx,
  borderClass,
  activeWorkflowId,
  running,
  editedWorkflow,
  workflows,
}: EditorProps): VNode {
  const reRender = useReRender();
  const hasWorkflow = Boolean(activeWorkflow.value);

  return (
    <Fragment>
      <div className={'row'}>
        <ActiveWorkflowSelect activeWorkflow={activeWorkflow}
          workflows={workflows}
          activeWorkflowId={activeWorkflowId}/>

        {hasWorkflow && (
          <SelectedWorkflowBtns running={running}
            refresh={reRender}
            editedWorkflow={editedWorkflow}
            activeWorkflow={activeWorkflow}/>
        )}
      </div>

      {hasWorkflow && (
        <RenderSteps activeWorkflow={activeWorkflow}
          activeStepIdx={activeStepIdx}
          running={running}
          borderClass={borderClass}/>
      )}
    </Fragment>
  );
}

const RenderSteps = memo<Pick<EditorProps, 'activeWorkflow' | 'borderClass' | 'activeStepIdx' | 'running'>>(
  ({activeStepIdx, activeWorkflow, borderClass, running}) => {
    const reRender = useReRender();

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
      const steps = [...workflow.steps];
      swapElements(steps, idx, idx + direction);
      workflow.steps = steps;
      reRender();

      WorkflowRegistry.inst.save();
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
                WorkflowRegistry.inst.primaryExecution$.value!.setActiveStepIdx(idx);
              }}
              step={step}
              {...stepProps[idx]}/>
          ))}
        </div>
      </BorderedBlock>
    );
  }
);

function ActiveWorkflowSelect({
  activeWorkflow,
  activeWorkflowId,
  workflows,
}: Pick<EditorProps, 'activeWorkflow' | 'activeWorkflowId' | 'workflows'>) {
  const wfsRef = useRef(workflows);
  wfsRef.current = workflows;

  const onWorkflowChange = useCallback((e: Event) => {
    const listId = parseInt((e.target as HTMLSelectElement).value);

    batch(() => {
      activeWorkflow.value = isNaN(listId) ? undefined : wfsRef.current.find(wf => wf.listId === listId);
      WorkflowRegistry.inst.setPrimaryExecution(); // unset, really
    });
  }, [activeWorkflow, wfsRef]);

  return (
    <Fragment>
      <div className={'col-auto font-w600 font-size-sm pr-1'}>Active workflow</div>
      <div className={'col-auto'}>
        <select className={'form-control form-control-sm'} value={activeWorkflowId.value ?? ''}
          onChange={onWorkflowChange}>
          {workflows.map(wf => <option key={wf.listId} value={wf.listId}>{wf.name}</option>)}
        </select>
      </div>
    </Fragment>
  );
}

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

function Inner(): VNode {
  const workflows = useBehaviourSubject(WorkflowRegistry.inst.workflows$);

  return workflows.length
    ? (<WithWorkflows workflows={workflows}/>)
    : (<NoDashboardsDefined/>);
}
