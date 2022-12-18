import type {ActivePrayer} from 'melvor';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';

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

    // Deactivate prayers that aren't selected
    for (const p of player.activePrayers) {
      if (!prayers?.includes(p)) {
        player.togglePrayer(p);
      }
    }

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
  label: 'Activate prayers',
  localID: 'activatePrayers',
  media: game.prayer.media,
  options: [
    {
      label: 'Prayers',
      localID: 'prayers',
      multi: {
        maxLength: 2,
      },
      registry: 'prayers',
      type: 'MediaItem',
    },
  ],
});
