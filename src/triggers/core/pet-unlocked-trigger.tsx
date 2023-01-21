import type {Pet} from 'melvor';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import {RenderNodeMedia} from '../../ui/pages/workflows-dashboard/render-node-media';
import TriggerId from '../trigger-id.mjs';

interface Data {
  pet: Pet;
}

function check({pet}: Data): boolean {
  return game.petManager.unlocked.has(pet);
}

const triggerCtx = defineLocalTrigger<Data>({
  category: InternalCategory.CORE,
  check,
  compactRender: ({pet}) => (
    <Fragment>
      <RenderNodeMedia label={pet.name} media={pet.media}/>
      <span>{' unlocked'}</span>
    </Fragment>
  ),
  id: TriggerId.CorePetUnlocked,
  init() {
    ctx.patch(PetManager, 'unlockPet').after(() => {
      triggerCtx.notifyListeners(check);
    });
  },
  label: 'Pet unlocked',
  media: game.pets.getObjectByID('melvorD:CoolRock')!.media,
  options: [
    {
      id: 'pet',
      label: 'Pet',
      registry: 'pets',
      required: true,
      type: 'MediaItem',
    },
  ],
});
