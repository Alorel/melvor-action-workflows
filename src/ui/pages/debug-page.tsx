import {startCase} from 'lodash-es';
import type {Currency, Game, Skill} from 'melvor';
import type {TypedKeys} from 'mod-util/typed-keys';
import type {VNode} from 'preact';
import {ACTION_REGISTRY} from '../../lib/registries/action-registry.mjs';
import {TRIGGER_REGISTRY} from '../../lib/registries/trigger-registry.mjs';
import WorkflowRegistry from '../../lib/registries/workflow-registry.mjs';
import {BlockDiv} from '../components/block';
import Btn from '../components/btn';
import autoId from '../id-gen.mjs';

export const DEBUG_PAGE_ID = autoId();

/* eslint-disable @typescript-eslint/no-magic-numbers */

export default function DebugPage(): VNode {
  return (
    <BlockDiv>
      <div class={'btn-group btn-group-sm'}>
        <LvAllSkills/>
        <UnlockSummoning/>
        <PrintLog/>
        <GetCurrency path={'gp'}/>
        <GetCurrency path={'slayerCoins'}/>
      </div>
    </BlockDiv>
  );
}

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
