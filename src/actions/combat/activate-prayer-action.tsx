import type {ActivePrayer} from 'melvor';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';

interface Props {
  prayers?: ActivePrayer[];
}

defineLocalAction<Props>({
  category: InternalCategory.COMBAT,
  compactRender({prayers}) {
    if (!prayers?.length) {
      return <Fragment>Deactivate prayers</Fragment>;
    }
  },
  execute({prayers}) {
    const player = game.combat.player;
    player.disableActivePrayers();

    if (!prayers?.length) {
      return;
    }

    // Activate prayers that are
    for (const p of prayers) {
      if (!player.activePrayers.has(p)) {
        player.togglePrayer(p);
      }
    }
  },
  id: ActionId.CombatActivatePrayers,
  label: 'Activate prayers',
  media: game.prayer.media,
  options: [
    {
      description: 'Leave empty to disable all prayers',
      id: 'prayers',
      label: 'Prayers',
      multi: {
        maxLength: 2,
      },
      registry: 'prayers',
      type: 'MediaItem',
    },
  ],
});
