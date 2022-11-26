import type {ReadonlySignal, Signal} from '@preact/signals';
import {signal, useComputed, useSignal} from '@preact/signals';
import {createContext} from 'preact';
import {useMemo} from 'preact/compat';
import {Workflow} from '../../../lib/data/workflow.mjs';

export interface EditorCtx {
  touched: Signal<boolean>;

  workflow: Workflow;
}

export const EDITOR_CTX = createContext<EditorCtx | undefined>(undefined);

function useEditorCtxProvider(
  starterWorkflow?: Signal<Workflow>
): [Signal<Workflow>, ReadonlySignal<EditorCtx>];
function useEditorCtxProvider(
  starterWorkflow: Signal<Workflow | undefined>
): [Signal<Workflow | undefined>, ReadonlySignal<EditorCtx>];
function useEditorCtxProvider(
  starterWorkflow?: Signal<Workflow | undefined>
): [Signal<Workflow>, ReadonlySignal<EditorCtx>] {
  const workflow = useMemo(() => starterWorkflow ?? signal(new Workflow()), [starterWorkflow]);
  const touched = useSignal(false);
  const editorCtx = useComputed((): EditorCtx => ({touched, workflow: workflow.value!}));

  return [workflow as Signal<Workflow>, editorCtx];
}

export {useEditorCtxProvider};

export const EDITOR_SECTION_CLASS = 'col-12 col-xl-11 m-auto';
