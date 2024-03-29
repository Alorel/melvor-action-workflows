import type {VNode} from 'preact';
import {Fragment} from 'preact';
import type {FunctionComponent} from 'preact/compat';
import {memo} from 'preact/compat';
import {useCallback} from 'preact/hooks';
import type {WorkflowStep} from '../../../../lib/data/workflow-step.mjs';
import {EMPTY_ARR} from '../../../../lib/util.mjs';
import swapElements from '../../../../lib/util/swap-elements.mjs';
import useReRender from '../../../hooks/re-render';
import useTippy from '../../../hooks/tippy.mjs';
import getEvtTarget from '../../../util/get-evt-target.mjs';
import {BorderedBlock} from '../../block';
import Btn from '../../btn';
import {BinSvg, ChevronLeftSvg, ChevronRightSvg} from '../../svg';
import ActionConfig from '../action-config';
import {useStep, useStepHost} from '../editor-contexts';
import NewStepHeader from './header-block';

interface Props {
  step: WorkflowStep;
}

const NewStep = memo<Props>(function NewStep({children, step: stepIn}) {
  const [ProvideStep, step$] = useStepHost(stepIn);
  step$.value = stepIn;

  const reRender = useReRender();

  const addAction = useCallback((): void => {
    step$.peek().addAction();
    reRender();
  }, EMPTY_ARR);

  const actions = stepIn.actions;
  const canMvActions = actions.length > 1;
  const lastActionIdx = actions.length - 1;

  return (
    <BorderedBlock kind={'summoning'} size={4} class={'col-12'}>
      <ProvideStep>
        <NewStepHeader/>
        <BorderedBlock kind={'thieving'}>
          <div class={'font-size-sm font-w600 mb-1'}>Actions</div>

          <div class={'row row-deck'}>
            {actions.map((action, i) => (
              <div class={'col-xs-12 col-xl-6'} key={action.listId}>
                <ActionConfig action={action}>
                  {canMvActions && (
                    <ActionMvBtns i={i}
                      lastActionIdx={lastActionIdx}
                      reRender={reRender}/>
                  )}

                </ActionConfig>
              </div>
            ))}
          </div>

          <div class={'text-right'}>
            <div class={'btn-group btn-group-sm'}>
              {children}
              <Btn kind={'success'} onClick={addAction}>{'Add action'}</Btn>
            </div>
          </div>
        </BorderedBlock>
      </ProvideStep>
    </BorderedBlock>
  );
});

export default NewStep;

interface BtnsProps {
  i: number;

  lastActionIdx: number;

  reRender(): void;
}

const ActionMvBtns: FunctionComponent<BtnsProps> = ({i, lastActionIdx, reRender}) => {
  const [rmAction, shiftActionIdx] = useStepMoveCallbacks(reRender);

  return (
    <Fragment>
      {i !== 0 && (
        <ActionMvBtn idx={i} shift={-1} onClick={shiftActionIdx}>
          <ChevronLeftSvg/>
        </ActionMvBtn>
      )}
      {i !== lastActionIdx && (
        <ActionMvBtn idx={i} shift={1} onClick={shiftActionIdx}>
          <ChevronRightSvg/>
        </ActionMvBtn>
      )}
      <ActionRmBtn idx={i} onClick={rmAction}/>
    </Fragment>
  );
};

interface MvBtnProps {
  idx: number;

  shift: 1 | -1;

  onClick(e: Event): void;
}

const ActionMvBtn = memo<MvBtnProps>(function ActionMvBtn({children, idx, onClick, shift}) {
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
});

type RmBtnProps = Pick<MvBtnProps, 'idx' | 'onClick'>;

const ActionRmBtn: FunctionComponent<RmBtnProps> = ({idx, onClick}): VNode => {
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

const useStepMoveCallbacks = (reRender: () => void) => {
  const step$ = useStep();

  const rmAction = useCallback((e: Event): void => {
    const btnEl = getEvtTarget(e, el => el.tagName === 'BUTTON');
    let idx: number;
    if (!btnEl || isNaN(idx = parseInt(btnEl?.dataset.idx as string))) {
      return;
    }

    step$.peek().actions.splice(idx, 1);
    reRender();
  }, [step$]);

  const shiftActionIdx = useCallback((e: Event): void => {
    const btnEl = getEvtTarget(e, el => el.tagName === 'BUTTON');
    let shift: number;

    if (!btnEl || isNaN(shift = parseInt(btnEl?.dataset.shift as string))) {
      return;
    }

    const idx = parseInt(btnEl!.dataset.idx!);
    if (isNaN(idx) || !swapElements(step$.peek().actions, idx, idx + shift)) {
      return;
    }

    reRender();
  }, [step$]);

  return [rmAction, shiftActionIdx] as const;
};
