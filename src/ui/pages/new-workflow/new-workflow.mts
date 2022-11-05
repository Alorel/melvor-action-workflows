import {Workflow} from '../../../lib/data/workflow.mjs';
import WorkflowRegistry from '../../../lib/registries/workflow-registry.mjs';
import {makeComponent} from '../../common.mjs';
import WorkflowEditor from '../../components/workflow-editor/workflow-editor.mjs';
import {sidebarItems} from '../../sidebar-mgr.mjs';
import tplId from './new-workflow.pug';

export default function NewWorkflowComponent() {
  const workflow = new Workflow();

  return makeComponent(`#${tplId}`, {
    editor() {
      return WorkflowEditor({
        onSave: () => {
          WorkflowRegistry.inst.add(Workflow.fromJSON(JSON.parse(JSON.stringify(workflow)))!);
          this.workflow.reset();
          sidebarItems.value.dashboard.click();
        },
        workflow: this.workflow,
      });
    },
    workflow,
  });
}
