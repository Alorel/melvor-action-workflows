import type {GatheringSkill} from 'melvor';
import type {Observable} from 'rxjs';
import {asyncScheduler, map, noop, scheduled} from 'rxjs';
import type {Obj} from '../../public_api';
import type {SkillActionInit} from './skill-action.mjs';
import SkillAction from './skill-action.mjs';

type Gathering = GatheringSkill<any>;

export interface RecipeActionInit<T extends object, S extends Gathering, R> {
  exec(this: RecipeAction<T, S, R>, data: T, prep: R): void;

  prepareExec?(this: RecipeAction<T, S, R>, data: T): R;
}

type Reqd<T extends object, S extends Gathering> = Required<RecipeActionInit<T, S, any>>;

export type RecipeOf<S> = S extends GatheringSkill<infer R> ? R : never;

type TCtx<T extends object, S extends Gathering, R, Ctx>
  = Obj<(this: RecipeAction<T, S, R> & Ctx, ...args: any[]) => any> & CtxExclude;

type CtxExclude = {[P in keyof RecipeActionBuilder<any, any>]?: never;};

export interface RecipeActionBuilder<T extends object, S extends Gathering, R = never, Ctx extends TCtx<T, S, R, Ctx> = {}> { // eslint-disable-line max-len
  exec(fn: (this: RecipeAction<T, S, R> & Ctx, data: T, prep: R) => void): RecipeAction<T, S, R> & Ctx;

  prep<RR>(fn: (this: RecipeAction<T, S, RR> & Ctx, data: T) => RR): RecipeActionBuilder<T, S, RR, Ctx>;
}

export class RecipeAction<T extends object, S extends Gathering, R>
  extends SkillAction<T, S>
  implements Reqd<T, S> {

  public exec: Reqd<T, S>['exec'];

  public prepareExec: Reqd<T, S>['prepareExec'];

  protected constructor(init: SkillActionInit<T>, {exec, prepareExec}: RecipeActionInit<T, S, R>) {
    super(init);
    this.exec = exec;
    this.prepareExec = prepareExec ?? noop;
  }

  public static base<T extends object, S extends Gathering>(init: SkillActionInit<T>): RecipeActionBuilder<T, S> {
    const finalCfg: Partial<RecipeActionInit<T, S, any>> = {};

    const builder: RecipeActionBuilder<T, S> = {
      exec: fn => {
        finalCfg.exec = fn;
        return new this(init, finalCfg as Required<typeof finalCfg>);
      },
      prep(fn) {
        finalCfg.prepareExec = fn;
        return builder;
      },
    };

    return builder;
  }

  /** @inheritDoc */
  public execute(data: T): Observable<void> {
    return scheduled(this.prepareExec.call(this, data), asyncScheduler).pipe( // eslint-disable-line no-useless-call
      map(prepData => {
        this.exec(data, prepData);
      })
    );
  }
}

