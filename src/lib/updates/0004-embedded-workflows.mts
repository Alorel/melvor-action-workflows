import type {DataUpdateFn} from '../data-update.mjs';
import type {WorkflowJson} from '../data/workflow.mjs';

const update0004: DataUpdateFn = (workflows: WorkflowJson[]) => {
  for (const wf of workflows) {
    if ((wf as readonly any[]).length === 2) {
      (wf as readonly any[] as any[]).push([]);
    }
  }
};

export default update0004;
