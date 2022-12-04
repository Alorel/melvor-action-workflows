import {batch} from '@preact/signals';
import type {VNode} from 'preact';
import {useCallback} from 'preact/hooks';
import {Workflow} from '../../lib/data/workflow.mjs';
import WorkflowRegistry from '../../lib/registries/workflow-registry.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import PageContainer from '../components/page-container';
import {useTouchedHost, useWorkflowHost} from '../components/workflow-editor/editor-contexts';
import WorkflowEditor from '../components/workflow-editor/workflow-editor';
import {sidebarItems} from '../sidebar-mgr.mjs';
import autoId from '../util/id-gen.mjs';

export const NEW_WORKFLOW_PAGE_ID = autoId();

export default function NewWorkflow(): VNode<any> {
  const [ProvideWorkflow, workflow] = useWorkflowHost(() => new Workflow());
  const [ProvideTouched, touched] = useTouchedHost(false);

  const onSave = useCallback((): void => {
    const wf = workflow.peek();
    if (!wf.isValid) {
      touched.value = true;
      return;
    }

    WorkflowRegistry.inst.add(wf);
    batch(() => {
      workflow.value = new Workflow();
      touched.value = false;
    });

    sidebarItems.value.dashboard.click();
  }, EMPTY_ARR);

  return (
    <PageContainer id={NEW_WORKFLOW_PAGE_ID}>
      <ProvideWorkflow>
        <ProvideTouched>
          <WorkflowEditor onSave={onSave}/>
        </ProvideTouched>
      </ProvideWorkflow>
    </PageContainer>
  );
}
