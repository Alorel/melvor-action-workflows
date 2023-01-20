import {staticComponent} from '@alorel/preact-static-component';
import {batch} from '@preact/signals';
import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {memo} from 'preact/compat';
import {useCallback} from 'preact/hooks';
import {Workflow} from '../../../lib/data/workflow.mjs';
import WorkflowRegistry from '../../../lib/registries/workflow-registry.mjs';
import {EMPTY_ARR} from '../../../lib/util.mjs';
import {alertConfirm} from '../../../lib/util/alert';
import {showExportModal} from '../../../lib/util/export-modal.mjs';
import Btn from '../../components/btn';
import {ConfigCheckbox, ConfigCheckboxKey} from '../../components/config-checkbox';
import {useActiveWorkflow, useEditedWorkflow} from '../../components/workflow-editor/editor-contexts';
import {useRunning} from '../../global-ctx';
import useReRender from '../../hooks/re-render';

interface SelectedWorkflowBtnsProps {
  refresh(): void;
}

export const SelectedWorkflowBtns = memo<SelectedWorkflowBtnsProps>(
  function SelectedWorkflowBtns({refresh}) {
    const running = useRunning().value;

    return (
      <Fragment>
        {running ? <BtnsRunning/> : <BtnsNotRunning refresh={refresh}/>}
        <div class={'mt-1'}>
          <ConfigCheckbox configKey={ConfigCheckboxKey.RM_WORKFLOW_ON_COMPLETE}>
            Remove workflow on completion
          </ConfigCheckbox>
        </div>
      </Fragment>
    );
  }
);

function useNestedRefresh(refresh: () => void): () => void {
  const ownRefresh = useReRender();
  return useCallback(() => {
    ownRefresh();
    refresh();
  }, [refresh]);
}

function BtnsNotRunning({refresh}: SelectedWorkflowBtnsProps): VNode {
  const activeWorkflow = useActiveWorkflow();
  const editedWorkflow = useEditedWorkflow();
  const doRefresh = useNestedRefresh(refresh);

  const reg = WorkflowRegistry.inst;
  const run = useCallback(() => {
    reg.setPrimaryExecution(activeWorkflow.peek(), true);
    doRefresh();
  }, [activeWorkflow, doRefresh]);

  const startEditing = useCallback(() => {
    batch(() => {
      editedWorkflow.value = Workflow.fromJSON(JSON.parse(JSON.stringify(activeWorkflow.peek())));
      reg.setPrimaryExecution();
    });
  }, [editedWorkflow, activeWorkflow]);

  const del = useCallback(() => {
    const activeWf = activeWorkflow.peek()!;

    alertConfirm(`Are you sure you want to delete "${activeWf.name}"?`)
      .subscribe(() => {
        batch(() => {
          activeWorkflow.value = undefined;
          reg.rmByIdx(reg.workflows.findIndex(wf => wf.listId === activeWf.listId));
          doRefresh();
        });
      });
  }, [activeWorkflow, doRefresh]);

  const clone = useCallback(() => {
    const active = activeWorkflow.peek()!;
    const cloned = Workflow.fromJSON(JSON.parse(JSON.stringify(active)))!;
    cloned.name += ` [copied ${new Date().toLocaleString()}]`;

    reg.add(cloned);
    activeWorkflow.value = cloned;
  }, [activeWorkflow]);

  const doExport = useCallback(() => {
    const wf = activeWorkflow.peek()!;
    showExportModal(`Export ${wf.name}`, wf);
  }, [activeWorkflow]);

  return (
    <div class={'btn-group btn-group-sm'}>
      <Btn kind={'success'} onClick={run}>{'Run'}</Btn>
      <Btn kind={'primary'} onClick={startEditing}>{'Edit'}</Btn>
      <Btn kind={'primary'} onClick={clone}>{'Copy'}</Btn>
      <Btn kind={'info'} onClick={doExport}>{'Export'}</Btn>
      <Btn kind={'danger'} onClick={del}>{'Delete'}</Btn>
    </div>
  );
}

const BtnsRunning = staticComponent(function BtnsRunning() {
  const onClick = useCallback(() => {
    WorkflowRegistry.inst.setPrimaryExecution(); // unset
  }, EMPTY_ARR);

  return (<Btn kind={'danger'} size={'sm'} onClick={onClick}>{'Stop'}</Btn>);
});
