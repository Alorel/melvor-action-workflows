import {staticComponent} from '@alorel/preact-static-component';
import {useComputed, useSignal} from '@preact/signals';
import {pick, startCase, stubFalse} from 'lodash-es';
import type {Currency, EquipmentItem, Game, Item, Skill} from 'melvor';
import type {TypedKeys} from 'mod-util/typed-keys';
import type {VNode} from 'preact';
import {Fragment} from 'preact';
import type {FunctionComponent} from 'preact/compat';
import {memo} from 'preact/compat';
import {useCallback, useMemo, useState} from 'preact/hooks';
import {getUpdateNumber} from '../../lib/data-update.mjs';
import {ACTION_REGISTRY} from '../../lib/registries/action-registry.mjs';
import {TRIGGER_REGISTRY} from '../../lib/registries/trigger-registry.mjs';
import WorkflowRegistry, {StorageKey} from '../../lib/registries/workflow-registry.mjs';
import {EMPTY_ARR} from '../../lib/util.mjs';
import {alertError, alertInfo} from '../../lib/util/alert';
import {debugLog} from '../../lib/util/log.mjs';
import RenderMediaEdit from '../../option-types/media-item/render-media-edit';
import type {MediaItemNodeOption} from '../../public_api';
import {BlockDiv, BorderedBlock} from '../components/block';
import Btn from '../components/btn';
import PageContainer from '../components/page-container';
import {ProvideNodeValidationCtx} from '../components/workflow-editor/render-node-option/node-option-validation-ctx';
import useReRender from '../hooks/re-render';
import autoId from '../util/id-gen.mjs';

export const DEBUG_PAGE_ID = autoId();

/* eslint-disable @typescript-eslint/no-magic-numbers */

const DebugPage = staticComponent(function DebugPage() {
  return (
    <PageContainer id={DEBUG_PAGE_ID}>
      <BlockDiv>
        <div class={'btn-group btn-group-sm mb-3'}>
          <LvAllSkills/>
          <UnlockSummoning/>
          <PrintLog/>
          <GetCurrency path={'gp'}/>
          <GetCurrency path={'slayerCoins'}/>
        </div>
        <ItemLookup/>
        <hr/>
        <DataVersionManagement/>
      </BlockDiv>
    </PageContainer>
  );
});

export default DebugPage;

const DataVersionManagement = (() => (): VNode => {
  const currVersion = ctx.accountStorage.getItem<number>(StorageKey.DATA_VERSION) ?? -1;

  const inputValue$ = useSignal(currVersion.toString());
  const max = useMemo(getUpdateNumber, EMPTY_ARR);
  const reRender = useReRender();

  const onInput = useCallback((e: Event) => {
    inputValue$.value = (e.target as HTMLInputElement).value;
  }, EMPTY_ARR);
  const save = useCallback(() => {
    const val = parseInt(inputValue$.peek());
    if (!isNaN(val) && val >= -1 && val <= max) {
      ctx.accountStorage.setItem(StorageKey.DATA_VERSION, val);
      reRender();
      alertInfo('Now reload', 'Done!');
    } else {
      debugLog(inputValue$.peek(), val);
      alertError(`Input dodgy - check console. Max: ${max}`);
    }
  }, EMPTY_ARR);

  return (
    <div>
      <div class={'font-size-sm font-w600'}>Data version mgmt</div>
      <div class={'form-inline'}>
        <span class={'mr-1'}>Curr version: {currVersion}</span>
        <input class={'form-control form-control-sm'}
          type={'number'}
          value={inputValue$.value}
          onInput={onInput}
          min={-1}
          max={max}/>
        <Btn onClick={save} kind={'primary'}>Save</Btn>
      </div>
    </div>
  );
})();

const ItemLookup = ((): FunctionComponent => {
  type TItemFmt = Pick<Item, 'category' | 'name' | 'id' | 'media' | 'type'>
    & Partial<Pick<EquipmentItem, 'validSlots' | 'tier'>>;

  const opt: MediaItemNodeOption = {
    id: '.',
    label: '.',
    registry: 'items',
    type: 'MediaItem',
  };

  const RenderItemFmt = memo<{item: TItemFmt}>(
    function RenderItemFmt({item}) {
      const qty = useSignal('1');
      const onChange = useCallback((e: Event): void => {
        qty.value = (e.target as HTMLInputElement).value;
      }, EMPTY_ARR);

      const grant = useCallback(() => {
        const num = parseInt(qty.peek());
        if (!isNaN(num)) {
          game.bank.addItemByID(item.id, num);
        }
      }, [item.id]);

      return (
        <Fragment>
          <div class={'input-group'}>
            <input placeholder={'Count'}
              class={'form-control form-control-sm'}
              type={'number'}
              value={qty.value}
              onInput={onChange}/>
            <Btn onClick={grant} kind={'primary'}>{'Get'}</Btn>
          </div>
          <pre className={'text-light'} style={'user-select:text'}>{JSON.stringify(item, null, 2)}</pre>
        </Fragment>
      );
    },
    ({item: a}, {item: b}) => a?.id === b?.id
  );

  const formatItem = (item: Item): TItemFmt => pick(item, [
    'name',
    'id',
    'category',
    'tier',
    'type',
    'validSlots',
    'media',
  ]) as TItemFmt;

  const ItemLookupInner = (): VNode => {
    const [item, setItem] = useState<Item | undefined>(undefined);

    return (
      <Fragment>
        <RenderMediaEdit value={item}
          option={opt}
          otherValues={{item}}
          onChange={setItem as (v?: Item) => void}/>
        {item && <RenderItemFmt item={formatItem(item)}/>}
      </Fragment>
    );
  };

  return function ItemLookup() { // eslint-disable-line @typescript-eslint/no-shadow
    const errors = useSignal(EMPTY_ARR);
    const touched = useSignal(false);
    const invalid = useComputed(stubFalse);

    return (
      <BorderedBlock kind={'woodcutting'} size={1}>
        <div class={'font-size-sm font-w600'}>{'Item lookup'}</div>
        <ProvideNodeValidationCtx errors={errors} touched={touched} invalid={invalid}>
          <ItemLookupInner/>
        </ProvideNodeValidationCtx>
      </BorderedBlock>
    );
  };
})();

function PrintLog(): VNode {
  return (
    <Btn onClick={() => {
      console.dir({
        actions: ACTION_REGISTRY,
        triggers: TRIGGER_REGISTRY,
        workflows: WorkflowRegistry.inst,
      });
    }}
    kind={'primary'}>{'console.dir all the things'}</Btn>
  );
}

function UnlockSummoning(): VNode {
  return (
    <Btn onClick={() => {
      const origSwal = Swal.fire;
      Swal.fire = (() => {
        const err = Promise.reject(new Error('Fire disabled'));
        return () => err;
      })();
      try {
        [...game.summoning.actions.registeredObjects.values()].forEach(m => game.summoning.discoverMark(m));
      } catch (e) {
        console.error(e);
      } finally {
        Swal.fire = origSwal;
      }
    }}
    kind={'primary'}>{'Unlock marks'}</Btn>
  );
}

function GetCurrency({path}: {path: TypedKeys<Game, Currency>}): VNode {
  return (
    <Btn onClick={() => {
      game[path].add(1_000_000_000);
    }}
    kind={'primary'}>{`Get ${startCase(path)}`}</Btn>
  );
}

function LvAllSkills(): VNode {
  return (
    <Btn onClick={() => {
      for (const skill of [
        'agility',
        'astrology',
        'cooking',
        'ranged',
        'crafting',
        'firemaking',
        'fishing',
        'fletching',
        'herblore',
        'mining',
        'runecrafting',
        'smithing',
        'summoning',
        'thieving',
        'woodcutting',
        'altMagic',
        'attack',
        'strength',
        'defence',
        'prayer',
        'slayer',
        'hitpoints',
        'farming',
        'township',
      ]) {
        (game[skill] as unknown as (Partial<Skill> | undefined))?.addXP?.(104_273_168);
      }
    }}
    kind={'primary'}>{'Level up'}</Btn>
  );
}
