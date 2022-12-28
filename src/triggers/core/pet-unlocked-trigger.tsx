import type {Pet} from 'melvor';
import {Fragment} from 'preact';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import {defineLocalTrigger} from '../../lib/util/define-local.mjs';
import {RenderNodeMedia} from '../../ui/pages/workflows-dashboard/render-node-media';

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
  init() {
    ctx.patch(PetManager, 'unlockPet').after(() => {
      triggerCtx.notifyListeners(check);
    });
  },
  label: 'Pet unlocked',
  localID: 'petUnlocked',
  media: game.pets.getObjectByID('melvorD:CoolRock')!.media,
  options: [
    {
      label: 'Pet',
      localID: 'pet',
      registry: 'pets',
      required: true,
      type: 'MediaItem',
    },
  ],
});
