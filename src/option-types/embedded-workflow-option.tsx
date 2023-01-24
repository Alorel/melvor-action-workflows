import type {VNode} from 'preact';
import {Fragment} from 'preact';
import {useCallback, useLayoutEffect} from 'preact/hooks';
import type {Workflow} from '../lib/data/workflow.mjs';
import {defineOption} from '../lib/define-option.mjs';
import {EMPTY_ARR} from '../lib/util.mjs';
import type {EmbeddedWorkflowOption} from '../public_api';
import Btn from '../ui/components/btn';
import {BinSvg} from '../ui/components/svg';
import {useWorkflow} from '../ui/components/workflow-editor/editor-contexts';
import {useBehaviourSubject} from '../ui/hooks/use-subject.mjs';
import {useRenderEditTouch} from './_common.mjs';

defineOption<string, EmbeddedWorkflowOption>({
  is: (v): v is EmbeddedWorkflowOption => v.type === 'EmbeddedWorkflow',
  renderEdit({
    option: {required},
    value,
    onChange,
  }) {
    const workflow = useWorkflow().value;
    const embeddedWorkflows$ = workflow.embeddedWorkflows$;
    const embeddedWorkflows = useBehaviourSubject(embeddedWorkflows$);

    const onBlur = useRenderEditTouch();
    const clear = useCallback(() => {
      onChange(undefined);
    }, EMPTY_ARR);
    const onInp = useCallback((e: Event) => {
      onChange((e.target as HTMLSelectElement).value || undefined);
    }, [onChange]);

    // Patch value
    useLayoutEffect(() => {
      if (embeddedWorkflows.length) {
        if (!value || !embeddedWorkflows.some(w => w.name === value)) {
          onChange(embeddedWorkflows[0].name);
        }
      } else if (value) {
        onChange(undefined);
      }
    }, [value, embeddedWorkflows, onChange]);

    if (!embeddedWorkflows.length) {
      return <div class={'alert alert-danger text-center'}>No embedded workflows defined</div>;
    }

    return (
      <div class={'input-group'}>
        {!required && <Btn kind={'danger'} size={'sm'} onClick={clear}><BinSvg/></Btn>}
        <select class={'form-control form-control-sm'} onBlur={onBlur} onChange={onInp} value={value}>
          {embeddedWorkflows.map(workflowEditMapper)}
        </select>
      </div>
    );
  },
  renderView: ({value}) => <Fragment>{value}</Fragment>,
  token: 'EmbeddedWorkflow',
});

function workflowEditMapper({listId, name}: Workflow): VNode {
  return <option key={listId} value={name}>{name}</option>;
}
