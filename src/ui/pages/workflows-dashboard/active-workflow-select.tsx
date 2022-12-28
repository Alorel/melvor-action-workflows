import {batch} from '@preact/signals';
import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {useCallback, useRef} from 'preact/hooks';
import type {Workflow} from '../../../lib/data/workflow.mjs';
import WorkflowRegistry from '../../../lib/registries/workflow-registry.mjs';
import {useActiveWorkflow} from '../../components/workflow-editor/editor-contexts';

interface Props {
  workflows: Workflow[];
}

export function ActiveWorkflowSelect({workflows}: Props): VNode {
  const activeWorkflow$ = useActiveWorkflow();
  const wfsRef = useRef(workflows);
  wfsRef.current = workflows;

  const onWorkflowChange = useCallback((e: Event) => {
    const listId = parseInt((e.target as HTMLSelectElement).value);

    batch(() => {
      activeWorkflow$.value = isNaN(listId) ? undefined : wfsRef.current.find(wf => wf.listId === listId);
      WorkflowRegistry.inst.setPrimaryExecution(); // unset, really
    });
  }, [activeWorkflow$]);

  return (
    <Fragment>
      <div className={'col-xs-12 col-sm-4 col-md-auto font-w600 font-size-sm pr-1'}>Active workflow</div>
      <div className={'col-xs-12 col-sm-8 col-md-auto'}>
        <select className={'form-control form-control-sm'} value={activeWorkflow$.value?.listId ?? ''}
          onChange={onWorkflowChange}>
          {workflows.map(wf => <option key={wf.listId} value={wf.listId}>{wf.name}</option>)}
        </select>
      </div>
    </Fragment>
  );
}
