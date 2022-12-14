import type {Signal} from '@preact/signals';
import {useSignal} from '@preact/signals';
import {memo} from 'preact/compat';
import {useCallback} from 'preact/hooks';
import WorkflowRegistry from '../../../lib/registries/workflow-registry.mjs';
import {EMPTY_ARR} from '../../../lib/util.mjs';
import useReRender from '../../hooks/re-render';
import {mkClass} from '../../util/mk-class.mjs';
import {BorderedBlock} from '../block';
import Btn from '../btn';
import {EDITOR_SECTION_CLASS, useWorkflow} from './editor-contexts';

export interface WorkflowEditorHeaderBlockProps {

  /**
   * Duplicate workflow names aren't permitted, but this check would trigger on itself when editing a workflow, so the
   * workflow's original name should be provided on edits so it can be used as an exception.
   */
  permitDupeName?: string;

  onSave(e: Event): void;
}

const WorkflowEditorHeaderBlock = memo<WorkflowEditorHeaderBlockProps>(
  function WorkflowEditorHeaderBlock({children, permitDupeName, onSave}) {
    return (
      <div className={EDITOR_SECTION_CLASS}>
        <BorderedBlock kind={'agility'} size={2}>
          <WorkflowNameEditor permitDupeName={permitDupeName}/>
          <WorkflowRemovableEditor/>

          <div className={'text-right mt-3'}>
            {children}
            <Btn kind={'success'} size={'sm'} onClick={onSave}>{'Save'}</Btn>
          </div>
        </BorderedBlock>
      </div>
    );
  }
);

export default WorkflowEditorHeaderBlock;

const WorkflowNameEditor = memo<Pick<WorkflowEditorHeaderBlockProps, 'permitDupeName'>>(function WorkflowNameEditor({permitDupeName}) {
  const [touched$, onBlur] = useTouched();
  const workflow$ = useWorkflow();
  const reRender = useReRender();

  const onChange = useCallback((e: Event): void => {
    workflow$.peek().name = (e.target as HTMLInputElement).value;
    reRender();
  }, [workflow$]);

  const name = workflow$.value.name;
  const err = name.trim()
    ? name !== permitDupeName && WorkflowRegistry.inst.workflows.some(w => w.name === name)
      ? 'Workflow names must be unique'
      : null
    : 'Required';

  const touched = touched$.value;

  return (
    <div class={mkClass('row', touched && 'ActionWorkflowsCore-touched')}>
      <span class={'font-size-sm pr-1 col-auto'}>{'Workflow name'}</span>
      <div class={mkClass('col-auto', err && 'ActionWorkflowsCore-f-invalid')}>
        <input
          class={'form-control form-control-sm'}
          value={name}
          onBlur={onBlur}
          onInput={onChange}
          required/>
        {touched && err && <div class={'text-danger'}>{err}</div>}
      </div>
    </div>
  );
});

const WorkflowRemovableEditor = memo(function WorkflowRemovableEditor() {
  const workflow$ = useWorkflow();
  const reRender = useReRender();

  const onChange = useCallback((e: Event): void => {
    workflow$.peek().rm = (e.target as HTMLInputElement).checked;
    reRender();
  }, [workflow$]);

  return (
    <div class={'row mt-1'}>
      <label class={'col-auto font-weight-normal'}>
        <input type={'checkbox'}
          class={'mr-1'}
          checked={workflow$.value.rm}
          onChange={onChange}
          required/>
        <span>Delete workflow on completion</span>
      </label>
    </div>
  );
});

function useTouched(): [Signal<boolean>, () => void] {
  const touched$ = useSignal(false);
  const onBlur = useCallback(() => {
    touched$.value = true;
  }, EMPTY_ARR);

  return [touched$, onBlur];
}


