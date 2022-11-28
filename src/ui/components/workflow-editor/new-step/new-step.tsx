import type {VNode} from 'preact';
import type {FunctionComponent} from 'preact/compat';
import {memo} from 'preact/compat';
import {useCallback, useContext} from 'preact/hooks';
import type {WorkflowStep} from '../../../../lib/data/workflow-step.mjs';
import swapElements from '../../../../lib/util/swap-elements.mjs';
import useReRender from '../../../hooks/re-render';
import useTippy from '../../../hooks/tippy.mjs';
import getEvtTarget from '../../../util/get-evt-target.mjs';
import {BorderedBlock} from '../../block';
import Btn from '../../btn';
import {BinSvg, ChevronLeftSvg, ChevronRightSvg} from '../../svg';
import ActionConfig from '../action-config';
import {EDITOR_CTX, EDITOR_SECTION_CLASS} from '../editor-ctx.mjs';
import NewStepHeader from './header-block';

interface Props {
  step: WorkflowStep;
}

const NewStep = memo<Props>(({children, step}): VNode => {
  const [addAction, rmAction, shiftActionIdx] = useStepCallbacks(step);

  const canMvActions = step.actions.length > 1;
  const lastStepIdx = useContext(EDITOR_CTX)!.workflow.lastStepIdx;

  return (
    <div class={EDITOR_SECTION_CLASS}>
      <BorderedBlock kind={'summoning'} size={4}>
        <NewStepHeader step={step}/>

        <BorderedBlock kind={'thieving'}>
          <div class={'font-size-sm font-w600 mb-1'}>{'Actions'}</div>

          <div class={'row row-deck'}>
            {step.actions.map((action, i) => (
              <div class={'col-12 col-xl-auto'} key={action.listId}>
                <ActionConfig action={action}>
                  {canMvActions && i !== 0 && (
                    <ActionMvBtn idx={i} shift={-1} onClick={shiftActionIdx}>
                      <ChevronLeftSvg/>
                    </ActionMvBtn>
                  )}
                  {canMvActions && i !== lastStepIdx && (
                    <ActionMvBtn idx={i} shift={1} onClick={shiftActionIdx}>
                      <ChevronRightSvg/>
                    </ActionMvBtn>
                  )}
                  {canMvActions && <ActionRmBtn idx={i} onClick={rmAction}/>}
                </ActionConfig>
              </div>
            ))}
          </div>

          <div class={'text-right'}>
            <div class={'btn-group btn-group-sm'}>
              <Btn kind={'success'} onClick={addAction}>{'Add action'}</Btn>
              {children}
            </div>
          </div>
        </BorderedBlock>
      </BorderedBlock>
    </div>
  );
});

export default NewStep;

interface MvBtnProps {
  idx: number;

  shift: 1 | -1;

  onClick(e: Event): void;
}

const ActionMvBtn: FunctionComponent<MvBtnProps> = ({children, idx, onClick, shift}) => {
  const btnRef = useTippy<HTMLButtonElement>(`Move this action ${shift === 1 ? 'forward' : 'back'}`);

  return (
    <Btn size={'sm'}
      kind={'light'}
      data-idx={idx}
      data-shift={shift}
      btnRef={btnRef}
      onClick={onClick}>
      {children}
    </Btn>
  );
};

type RmBtnProps = Pick<MvBtnProps, 'idx' | 'onClick'>;

const ActionRmBtn = ({idx, onClick}: RmBtnProps): VNode => {
  const btnRef = useTippy<HTMLButtonElement>('Remove this action');

  return (
    <Btn size={'sm'}
      kind={'danger'}
      data-idx={idx}
      btnRef={btnRef}
      onClick={onClick}>
      <BinSvg/>
    </Btn>
  );
};

function useStepCallbacks(step: WorkflowStep) {
  const reRender = useReRender();

  const addAction = useCallback((): void => {
    step.addAction();
    reRender();
  }, [step]);

  const rmAction = useCallback((e: Event): void => {
    const btnEl = getEvtTarget(e, el => el.tagName === 'BUTTON');
    let idx: number;
    if (!btnEl || isNaN(idx = parseInt(btnEl?.dataset.idx as string))) {
      return;
    }

    step.actions.splice(idx, 1);
    reRender();
  }, [step.actions]);

  const shiftActionIdx = useCallback((e: Event): void => {
    const btnEl = getEvtTarget(e, el => el.tagName === 'BUTTON');
    let shift: number;

    if (!btnEl || isNaN(shift = parseInt(btnEl?.dataset.shift as string))) {
      return;
    }

    const idx = parseInt(btnEl!.dataset.idx!);
    if (isNaN(idx)) {
      return;
    }

    swapElements(step.actions, idx, idx + shift);
    reRender();
  }, [step.actions]);

  return [addAction, rmAction, shiftActionIdx] as const;
}
