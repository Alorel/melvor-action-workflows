import type {VNode} from 'preact';
import {useCallback} from 'preact/hooks';
import {Workflow} from '../../lib/data/workflow.mjs';
import WorkflowRegistry from '../../lib/registries/workflow-registry.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import {showExportModal, showImportModal} from '../../lib/util/export-modal.mjs';
import {BlockDiv} from '../components/block';
import Btn from '../components/btn';
import PageContainer from '../components/page-container';
import autoId from '../util/id-gen.mjs';

export const IMPORT_PAGE_ID = autoId();
const btnSizeClass = 'sm btn-block';

export default function ImportExportPage(): VNode {
  return (
    <PageContainer id={IMPORT_PAGE_ID}>
      <BlockDiv class={'pb-3'}>
        <ExportAll/>
        <ImportAll/>
        <ImportOne/>
      </BlockDiv>
    </PageContainer>
  );
}

function ImportAll(): VNode {
  const onClick = useCallback(() => {
    const import$ = showImportModal('Import workflow', json => {
      try {
        const parsed = JSON.parse(json);
        if (!Array.isArray(parsed)) {
          return 'Expected a JSON array';
        } else if (!parsed.length) {
          return 'The array is empty';
        }

        for (let i = 0; i < parsed.length; ++i) {
          if (!Workflow.fromJSON(parsed[i])) {
            return `Invalid workflow at index ${i}`;
          }
        }

        return null;
      } catch (e) {
        return e.message;
      }
    });

    import$
      .subscribe(rsp => {
        const reg = WorkflowRegistry.inst;

        // Overwrite workflows with duplicate names, add workflows with unique names
        for (const workflow of (JSON.parse(rsp) as any[]).map(Workflow.fromJSON) as Workflow[]) {
          const idx = reg.workflows.findIndex(w => w.name === workflow.name);
          if (idx === -1) {
            reg.add(workflow);
          } else {
            reg.patch(workflow, idx);
          }
        }

        alertDone();
      });
  }, EMPTY_ARR);

  return <Btn kind={'info'} size={btnSizeClass} onClick={onClick}>Import workflows</Btn>;
}

function ImportOne(): VNode {
  const onClick = useCallback(() => {
    const import$ = showImportModal('Import workflow', json => {
      try {
        return Workflow.fromJSON(JSON.parse(json)) ? null : 'Invalid workflow';
      } catch (e) {
        return e.message;
      }
    });

    import$
      .subscribe(rsp => {
        const reg = WorkflowRegistry.inst;
        const workflow = Workflow.fromJSON(JSON.parse(rsp))!;

        // Overwrite on duplicate name
        const existingIdx = reg.workflows.findIndex(w => w.name === workflow.name);
        if (existingIdx === -1) {
          reg.add(workflow);
        } else {
          reg.patch(workflow, existingIdx);
        }
        alertDone();
      });
  }, EMPTY_ARR);

  return <Btn kind={'info'} size={btnSizeClass} onClick={onClick}>Import workflow</Btn>;
}

function ExportAll(): VNode {
  const onClick = useCallback(() => {
    showExportModal('Export workflows', WorkflowRegistry.inst.workflows);
  }, EMPTY_ARR);

  return <Btn kind={'primary'} size={btnSizeClass} onClick={onClick}>Export workflows</Btn>;
}

function alertDone() {
  Swal // eslint-disable-line @typescript-eslint/no-floating-promises
    .fire({
      confirmButtonText: 'OK',
      showCancelButton: false,
      showConfirmButton: true,
      text: 'Done!',
    });
}
