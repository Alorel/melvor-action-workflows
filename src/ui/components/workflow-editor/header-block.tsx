import type {Signal} from '@preact/signals';
import {useSignal} from '@preact/signals';
import type {RenderableProps} from 'preact';
import {memo} from 'preact/compat';
import {useCallback} from 'preact/hooks';
import WorkflowRegistry from '../../../lib/registries/workflow-registry.mjs';
import {EMPTY_ARR} from '../../../lib/util.mjs';
import useReRender from '../../hooks/re-render';
import {mkClass} from '../../util/mk-class.mjs';
import {BorderedBlock} from '../block';
import Btn from '../btn';
import {EDITOR_SECTION_CLASS, useWorkflow} from './editor-contexts';

interface EmbeddedProps {
  embedded: true;
}

interface TopLevelProps {
  embedded?: false;

  onSave(e: Event): void;


  /**
   * Duplicate workflow names aren't permitted, but this check would trigger on itself when editing a workflow, so the
   * workflow's original name should be provided on edits so it can be used as an exception.
   */
  permitDupeName?: string;
}

export type WorkflowEditorHeaderBlockProps = EmbeddedProps | TopLevelProps;
type CombinedProps = RenderableProps<Omit<TopLevelProps, 'embedded'> & {embedded?: boolean;}>;

const WorkflowEditorHeaderBlock = memo<WorkflowEditorHeaderBlockProps>(
  function WorkflowEditorHeaderBlock({children, embedded, permitDupeName, onSave}: CombinedProps) {
    return (
      <div className={EDITOR_SECTION_CLASS}>
        <BorderedBlock kind={'agility'} size={2}>
          <WorkflowNameEditor permitDupeName={permitDupeName} embedded={embedded}/>

          <div className={'text-right mt-3'}>
            {children}
            {!embedded && <Btn kind={'success'} size={'sm'} onClick={onSave}>{'Save'}</Btn>}
          </div>
        </BorderedBlock>
      </div>
    );
  }
);

export default WorkflowEditorHeaderBlock;

const WorkflowNameEditor = memo<Pick<CombinedProps, 'permitDupeName' | 'embedded'>>(
  function WorkflowNameEditor({embedded, permitDupeName}) {
    const [touched$, onBlur] = useTouched();
    const workflow$ = useWorkflow();
    const reRender = useReRender();

    const onChange = useCallback((e: Event): void => {
      workflow$.peek().name = (e.target as HTMLInputElement).value;
      reRender();
    }, [workflow$]);

    const name = workflow$.value.name;
    const err = name.trim()
      ? !embedded && name !== permitDupeName && WorkflowRegistry.inst.workflows.some(w => w.name === name)
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
  }
);

function useTouched(): [Signal<boolean>, () => void] {
  const touched$ = useSignal(false);
  const onBlur = useCallback(() => {
    touched$.value = true;
  }, EMPTY_ARR);

  return [touched$, onBlur];
}


