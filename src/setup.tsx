import {nextComplete, setDefaultLogger} from '@aloreljs/rxutils';
import {takeTruthy} from '@aloreljs/rxutils/operators';
import type {Signal} from '@preact/signals';
import {signal} from '@preact/signals';
import {render} from 'preact';
import type {Observable} from 'rxjs';
import {AsyncSubject, EMPTY, map, switchMap, takeUntil} from 'rxjs';
import './actions/actions.mjs';
import {WorkflowEventType} from './lib/execution/workflow-event.mjs';
import {TRIGGER_REGISTRY} from './lib/registries/trigger-registry.mjs';
import WorkflowRegistry from './lib/registries/workflow-registry.mjs';
import {debugLog, errorLog} from './lib/util/log.mjs';
import './option-types/option-types.mjs';
import './triggers/index.mjs';
import App from './ui/app';
import {SIDENAV_ITEM} from './ui/sidebar-mgr.mjs';
import './ui/ui.mjs';

// ctx.api<Readonly<Api>>(api); // rollup will freeze it

setDefaultLogger(errorLog);

let sidenavIconContainer: Signal<HTMLSpanElement | null>;
let reg: WorkflowRegistry;
const interfaceReady$ = new AsyncSubject<void>();

ctx.onCharacterLoaded(() => {
  for (const {def, id} of TRIGGER_REGISTRY.registeredObjects.values()) {
    try {
      def.init?.();
    } catch (e) {
      errorLog(`Failed to initialise trigger ${id}:`, e);
    }
  }

  debugLog('Triggers initialised');

  reg = WorkflowRegistry.inst;

  // Start listening on the primary execution to enable offline support
  reg.monitorPrimaryExecutionState();

  // Prevent the execution from showing up as active when it completes
  if (reg.primaryExecution) {
    if (reg.primaryExecution.isFinished) {
      reg.setPrimaryExecution();
    } else {
      reg.primaryExecution$
        .pipe(
          switchMap((exec): Observable<boolean> => {
            if (!exec) {
              return EMPTY;
            }

            return exec.pipe(
              map(evt => evt.type === WorkflowEventType.WORKFLOW_COMPLETE),
              takeTruthy(1)
            );
          }),
          takeUntil(interfaceReady$)
        )
        .subscribe(() => {
          reg.setPrimaryExecution();
        });
    }
  }

  debugLog('Primary execution monitored');

  sidenavIconContainer = signal<HTMLSpanElement | null>(null);
  render(<App sidenavIcon={sidenavIconContainer}/>, document.createElement('div'));
});

ctx.onInterfaceReady(() => {
  debugLog('Interface ready');
  nextComplete(interfaceReady$);

  sidebar
    .category('')
    .item('Action Workflows', {
      after: 'melvorD:Bank',
    });

  const iconContainer = SIDENAV_ITEM.value.iconEl;
  iconContainer.classList.remove('nav-img');
  iconContainer.innerHTML = '';

  sidenavIconContainer.value = iconContainer;
});
