import {batch} from '@preact/signals';
import type {VNode} from 'preact';
import {useCallback} from 'preact/hooks';
import {Workflow} from '../../lib/data/workflow.mjs';
import WorkflowRegistry from '../../lib/registries/workflow-registry.mjs';
import {EDITOR_CTX, useEditorCtxProvider} from '../components/workflow-editor/editor-ctx.mjs';
import WorkflowEditor from '../components/workflow-editor/workflow-editor';
import {sidebarItems} from '../sidebar-mgr.mjs';
import autoId from '../util/id-gen.mjs';

export const NEW_WORKFLOW_PAGE_ID = autoId();

export default function NewWorkflow(): VNode<any> {
  const [workflow, editorCtx] = useEditorCtxProvider();

  const onSave = useCallback((): void => {
    const wf = workflow.peek();
    const editCtx = editorCtx.peek();
    if (!wf.isValid) {
      editCtx.touched.value = true;
      return;
    }

    WorkflowRegistry.inst.add(wf);
    batch(() => {
      workflow.value = new Workflow();
      editCtx.touched.value = false;
    });

    sidebarItems.value.dashboard.click();
  }, [workflow]);

  const ProvideEditorCtx = EDITOR_CTX.Provider;

  return (
    <ProvideEditorCtx value={editorCtx.value}>
      <WorkflowEditor onSave={onSave}/>
    </ProvideEditorCtx>
  );
}
