import type {ReadonlySignal, Signal} from '@preact/signals';
import {batch} from '@preact/signals';
import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {useEffect} from 'preact/hooks';
import type {Observable} from 'rxjs';
import {EMPTY, of, switchMap} from 'rxjs';
import type {WorkflowCompleteEvent} from '../lib/execution/workflow-event.mjs';
import {WorkflowEventType} from '../lib/execution/workflow-event.mjs';
import type {WorkflowExecution} from '../lib/execution/workflow-execution.mjs';
import WorkflowRegistry from '../lib/registries/workflow-registry.mjs';
import {EMPTY_ARR} from '../lib/util.mjs';
import SidenavIcon from './components/sidenav-icon';
import {useBorderClassHost, usePrimaryExecutionHost, useRunningHost} from './global-ctx';
import DebugPage from './pages/debug-page';
import HelpPage from './pages/help-page';
import NewWorkflow from './pages/new-workflow';
import WorkflowsDashboard from './pages/workflows-dashboard';

interface AppProps<T extends Element> {
  sidenavIcon: ReadonlySignal<T | null>;
}

export default function App<T extends Element>({sidenavIcon}: AppProps<T>): VNode {
  const [ProvidePrimaryExecution, primaryExecution$] = usePrimaryExecutionHost(undefined);
  const [ProvideBorderClass, borderClass$] = useBorderClassHost(Strings.STD_BORDER);
  const [ProvideRunning, running$] = useRunningHost(false);

  usePrimaryExecutionSignalUpdates(primaryExecution$, borderClass$, running$);

  return (
    <Fragment>
      <NewWorkflow/>
      <HelpPage/>
      <ProvideRunning>
        <SidenavIcon container={sidenavIcon}/>
        <ProvidePrimaryExecution>
          <ProvideBorderClass>
            <WorkflowsDashboard/>
          </ProvideBorderClass>
        </ProvidePrimaryExecution>
      </ProvideRunning>
      {!process.env.PRODUCTION && <DebugPage/>}
    </Fragment>
  );
}

function usePrimaryExecutionSignalUpdates(
  primaryExecution$: Signal<WorkflowExecution | undefined>,
  borderClass$: Signal<string>,
  running$: Signal<boolean>
): void {
  useEffect(() => {
    // key = css class, value = whether it means the workflow is running or not
    const classMappings = new Map<Strings, boolean>([
      [Strings.RUNNING_BORDER, true],
      [Strings.STD_BORDER, false],
      [Strings.DONE_OK_BORDER, false],
      [Strings.DONE_ERR_BORDER, false],
    ]);

    const sub = WorkflowRegistry.inst.primaryExecution$
      .pipe(
        switchMap((exec): Observable<Strings> => {
          if (!exec) {
            return of(Strings.STD_BORDER);
          }

          // Bit of repetition, but makes sure all the signals update in the same tick
          batch(() => {
            primaryExecution$.value = exec;
            running$.value = exec.running;
            borderClass$.value = exec.running ? Strings.RUNNING_BORDER : Strings.STD_BORDER;
          });

          return exec.pipe(
            switchMap(evt => {
              switch (evt.type) {
                case WorkflowEventType.WORKFLOW_START:
                  return of(Strings.RUNNING_BORDER);
                case WorkflowEventType.WORKFLOW_COMPLETE:
                  return of((evt as WorkflowCompleteEvent).ok ? Strings.DONE_OK_BORDER : Strings.DONE_ERR_BORDER);
                default:
                  return EMPTY;
              }
            })
          );
        })
      )
      .subscribe(border => {
        batch(() => {
          borderClass$.value = border;
          running$.value = classMappings.get(border)!;
        });
      });

    return () => {
      sub.unsubscribe();
    };
  }, EMPTY_ARR);
}

const enum Strings {
  STD_BORDER = 'summoning',
  RUNNING_BORDER = 'agility',
  DONE_OK_BORDER = 'woodcutting',
  DONE_ERR_BORDER = 'fletching',
}
