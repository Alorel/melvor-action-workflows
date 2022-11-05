import {nextComplete} from '@aloreljs/rxutils';
import type {Agility} from 'melvor';
import {asyncScheduler, Observable, scheduled} from 'rxjs';
import {defineAction} from '../../lib/api.mjs';
import {InternalCategory} from '../../lib/registries/action-registry.mjs';
import SkillAction from '../_common/skill-action.mjs';

class AgilityAction extends SkillAction<{}, Agility> {
  public execute(): Observable<void> {
    return scheduled(
      new Observable(subscriber => {
        this.skill.start();
        nextComplete(subscriber);
      }),
      asyncScheduler
    );
  }
}

defineAction(new AgilityAction({
  category: InternalCategory.START_SKILL,
  localID: 'startAgility',
  skillKey: 'agility',
}));
