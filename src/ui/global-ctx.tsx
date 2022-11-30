import type {ReadonlySignal} from '@preact/signals-core';
import type {WorkflowExecution} from '../lib/execution/workflow-execution.mjs';
import {signalContext} from './util/signal-context';

const [usePrimaryExecutionRaw, usePrimaryExecutionHost] = signalContext<WorkflowExecution | undefined>('primaryExecution');
const [useBorderClassRaw, useBorderClassHost] = signalContext('borderClass', 'summoning');
const [useRunningRaw, useRunningHost] = signalContext('running', false);
const [useActiveStepIdxRaw, useActiveStepIdxHost] = signalContext('activeStepIdx', -1);

// typecasts - we don't want code to be setting these

const usePrimaryExecution: () => ReadonlySignal<WorkflowExecution | undefined> = usePrimaryExecutionRaw;
const useBorderClass: () => ReadonlySignal<string> = useBorderClassRaw;
const useRunning: () => ReadonlySignal<boolean> = useRunningRaw;

const useActiveStepIdx: () => ReadonlySignal<number> = useActiveStepIdxRaw;

export {
  useActiveStepIdx,
  useActiveStepIdxHost,
  useRunning,
  useRunningHost,
  useBorderClass,
  useBorderClassHost,
  usePrimaryExecution,
  usePrimaryExecutionHost
};
