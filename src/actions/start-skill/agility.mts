import type {Agility} from 'melvor';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import PersistClassName from '../../lib/util/decorators/PersistClassName.mjs';
import {defineLocalAction} from '../../lib/util/define-local.mjs';
import ActionId from '../action-id.mjs';
import SkillAction from '../lib/skill-action.mjs';

@PersistClassName('AgilityAction')
class AgilityAction extends SkillAction<{}, Agility> {

  /** @inheritDoc */
  public override execute(): void {
    this.skill.start();
  }
}

defineLocalAction(new AgilityAction({
  category: InternalCategory.START_SKILL,
  id: ActionId.StartSkillAgility,
  skillKey: 'agility',
}));
