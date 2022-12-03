import type {Signal} from '@preact/signals';
import {useSignal} from '@preact/signals';
import {memo} from 'preact/compat';
import {useCallback} from 'preact/hooks';
import {EMPTY_ARR} from '../../../lib/util.mjs';
import useReRender from '../../hooks/re-render';
import {mkClass} from '../../util/mk-class.mjs';
import {BorderedBlock} from '../block';
import Btn from '../btn';
import {EDITOR_SECTION_CLASS, useWorkflow} from './editor-contexts';

export interface WorkflowEditorHeaderBlockProps {
  onSave(e: Event): void;
}

const WorkflowEditorHeaderBlock = memo<WorkflowEditorHeaderBlockProps>(({children, onSave}) => (
  <div className={EDITOR_SECTION_CLASS}>
    <BorderedBlock kind={'agility'} size={2}>
      <WorkflowNameEditor/>
      <WorkflowRemovableEditor/>

      <div className={'text-right mt-3'}>
        {children}
        <Btn kind={'success'} size={'sm'} onClick={onSave}>{'Save'}</Btn>
      </div>
    </BorderedBlock>
  </div>
));
WorkflowEditorHeaderBlock.displayName = 'WorkflowEditorHeaderBlock';

export default WorkflowEditorHeaderBlock;

const WorkflowNameEditor = memo(function WorkflowNameEditor() {
  const [touched$, onBlur] = useTouched();
  const workflow$ = useWorkflow();
  const reRender = useReRender();

  const onChange = useCallback((e: Event): void => {
    workflow$.peek().name = (e.target as HTMLInputElement).value;
    reRender();
  }, [workflow$]);

  const name = workflow$.value.name;

  return (
    <div className={mkClass('row', touched$.value && 'ActionWorkflowsCore-touched')}>
      <span className={'font-size-sm pr-1 col-auto'}>{'Workflow name'}</span>
      <div className={mkClass('col-auto', !name.trim() && 'ActionWorkflowsCore-f-invalid')}>
        <input className={'form-control form-control-sm'}
          value={name}
          onBlur={onBlur}
          onInput={onChange}
          required/>
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


