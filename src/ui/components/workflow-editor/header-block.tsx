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

const WorkflowEditorHeaderBlock = memo<WorkflowEditorHeaderBlockProps>(({
  children,
  onSave,
}) => {
  const workflow$ = useWorkflow();
  const inpTouched = useSignal(false);
  const reRender = useReRender();

  const onBlur = useCallback(() => {
    inpTouched.value = true;
  }, EMPTY_ARR);
  const onChange = useCallback((e: Event): void => {
    workflow$.peek().name = (e.target as HTMLInputElement).value;
    reRender();
  }, [workflow$]);

  const workflow = workflow$.value;

  return (
    <div className={EDITOR_SECTION_CLASS}>
      <BorderedBlock kind={'agility'} size={2}>
        <div className={mkClass('row mb-3', inpTouched.value && 'ActionWorkflowsCore-touched')}>
          <span className={'font-size-sm pr-1 col-auto'}>{'Workflow name'}</span>
          <div className={mkClass('col-auto', !workflow.name.trim() && 'ActionWorkflowsCore-f-invalid')}>
            <input className={'form-control form-control-sm'}
              value={workflow.name}
              onBlur={onBlur}
              onInput={onChange}
              required/>
          </div>
        </div>

        <div className={'text-right'}>
          {children}
          <Btn kind={'success'} size={'sm'} onClick={onSave}>{'Save'}</Btn>
        </div>
      </BorderedBlock>
    </div>
  );
});
WorkflowEditorHeaderBlock.displayName = 'WorkflowEditorHeaderBlock';

export default WorkflowEditorHeaderBlock;


