import type {Agility} from 'melvor';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import PersistClassName from '../../lib/util/decorators/PersistClassName.mjs';
import SkillAction from '../lib/skill-action.mjs';

@PersistClassName('AgilityAction')
class AgilityAction extends SkillAction<{}, Agility> {

  /** @inheritDoc */
  public override execute(): void {
    this.skill.start();
  }
}

defineAction(new AgilityAction({
  category: InternalCategory.START_SKILL,
  localID: 'startAgility',
  skillKey: 'agility',
}));
