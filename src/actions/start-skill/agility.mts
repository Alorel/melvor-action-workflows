import {nextComplete} from '@aloreljs/rxutils';
import type {Agility} from 'melvor';
import {Observable} from 'rxjs';
import {defineAction} from '../../lib/api.mjs';
import PersistClassName from '../../lib/decorators/PersistClassName.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import SkillAction from '../lib/skill-action.mjs';

@PersistClassName('AgilityAction')
class AgilityAction extends SkillAction<{}, Agility> {

  /** @inheritDoc */
  public override execute(): Observable<void> {
    return new Observable(subscriber => {
      game.stopActiveAction();
      this.skill.start();
      nextComplete(subscriber);
    });
  }
}

defineAction(new AgilityAction({
  category: InternalCategory.START_SKILL,
  localID: 'startAgility',
  skillKey: 'agility',
}));
